/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2015 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'helpers',
    'layout/loading-bar',
    'util/encode',
    'ui/feedback',
    'ui/dialog',
    'ui/bulkActionPopup',
    'taoProctoring/component/breadcrumbs',
    'taoProctoring/helper/status',
    'tpl!taoProctoring/tpl/item-progress',
    'tpl!taoProctoring/tpl/delivery-link',
    'ui/datatable'
], function ($, _, __, helpers, loadingBar, encode, feedback, dialog, bulkActionPopup, breadcrumbsFactory, _status, itemProgressTpl, deliveryLinkTpl) {
    'use strict';

    /**
     * The CSS scope
     * @type {String}
     */
    var cssScope = '.delivery-monitoring';

    // the page is always loading data when starting
    loadingBar.start();

    /**
     * Formats a time value to string
     * @param {Number} time
     * @returns {String}
     * @private
     */
    var _timerFormat = function(time) {
        return __('%d min', Math.floor(time / 60));
    };

    var notYet = function() {
        dialog({
            message: __('Not yet implemented!'),
            autoRender: true,
            autoDestroy: true,
            buttons: 'ok'
        });
    };
    
    /**
     * Controls the taoProctoring delivery page
     *
     * @type {Object}
     */
    var proctorDeliveryIndexCtlr = {
        /**
         * Entry point of the page
         */
        start : function start() {
            var $container = $(cssScope);
            var $content = $container.find('.content');
            var $list = $container.find('.list');
            var crumbs = $container.data('breadcrumbs');
            var dataset = $container.data('set');
            var categories = $container.data('categories');
            var deliveryId = $container.data('delivery');
            var testCenterId = $container.data('testcenter');
            var manageUrl = helpers._url('manage', 'Delivery', 'taoProctoring', {delivery : deliveryId, testCenter : testCenterId});
            var terminateUrl = helpers._url('terminateExecutions', 'Delivery', 'taoProctoring', {delivery : deliveryId, testCenter : testCenterId});
            var pauseUrl = helpers._url('pauseExecutions', 'Delivery', 'taoProctoring', {delivery : deliveryId, testCenter : testCenterId});
            var authoriseUrl = helpers._url('authoriseExecutions', 'Delivery', 'taoProctoring', {delivery : deliveryId, testCenter : testCenterId});
            var serviceUrl = helpers._url('deliveryExecutions', 'Delivery', 'taoProctoring', {delivery : deliveryId, testCenter : testCenterId});
            var serviceAllUrl = helpers._url('allDeliveriesExecutions', 'Delivery', 'taoProctoring', {testCenter : testCenterId});
            var tools = [];
            var actions = [];
            var model = [];

            var bc = breadcrumbsFactory($container, crumbs);

            // request the server with a selection of test takers
            function request(url, selection, message) {
                if (selection && selection.length) {
                    loadingBar.start();

                    $.ajax({
                        url: url,
                        data: {
                            execution: selection
                        },
                        dataType : 'json',
                        type: 'POST',
                        error: function() {
                            loadingBar.stop();
                        }
                    }).done(function(response) {
                        loadingBar.stop();

                        if (response && response.success) {
                            if (message) {
                                feedback().success(message);
                            }
                            $list.datatable('refresh');
                        } else {
                            feedback().error(__('Something went wrong ...') + '<br>' + encode.html(response.error), {encodeHtml: false});
                        }
                    });
                }
            }

            // request the server to authorise the selected delivery executions
            function authorise(selection) {
                execBulkAction('authorize', __('Authorize Delivery Session'), selection, function(){
                    notYet();
                    //request(authoriseUrl, selection, __('Delivery executions have been authorised'));
                });
            }

            // request the server to pause the selected delivery executions
            function pause(selection) {
                execBulkAction('pause', __('Pause Delivery Session'), selection, function(){
                    notYet();
                    //request(pauseUrl, selection, __('Delivery executions have been paused'));
                });
            }

            // request the server to terminate the selected delivery executions
            function terminate(selection) {
                execBulkAction('terminate', __('Terminate Delivery Session'), selection, function(){
                    notYet();
                    //request(terminateUrl, selection, __('Delivery executions have been terminated'));
                });
            }
            
            function verifyTestTaker(testTakerData, actionName){
                var formatted = {
                    id : testTakerData.id,
                    label : testTakerData.firstname+' '+testTakerData.lastname
                };
                var status = _status.getStatusByCode(testTakerData.state.status);
                if(status){
                    formatted.allowed = (status.can[actionName] === true);
                    if(!formatted.allowed){
                        formatted.reason = status.can[actionName];
                    }
                }
                return formatted;
            }
            
            function execBulkAction(actionName, actionTitle, selection, cb){
                
                var allowedTestTakers = [];
                var forbiddenTestTakers = [];
                _.each(selection, function(uri){
                    var testTaker = _.find(dataset.data, {id : uri});
                    var checkedTestTaker;
                    if(testTaker){
                        checkedTestTaker = verifyTestTaker(testTaker, actionName);
                        if(checkedTestTaker.allowed){
                            allowedTestTakers.push(checkedTestTaker);
                        }else{
                            forbiddenTestTakers.push(checkedTestTaker);
                        }
                    }
                });
                var config = _.assign({
                    renderTo : $content,
                    actionName : actionTitle,
                    resourceType : 'test taker',
                    allowedResources : allowedTestTakers,
                    deniedResources : forbiddenTestTakers
                }, categories[actionName]);
                
                bulkActionPopup(config).on('ok', function(reason){
                    //execute callback
                    if(_.isFunction(cb)){
                        cb(selection, reason);
                    }
                });
            }
            
            // report irregularities on the selected delivery executions
            var report = function(selection) {
                execBulkAction('report', __('Report Irregularity'), selection, function(selection, reason){
                    console.log('reported', selection, 'with reason', reason);
                    notYet();
                });
            };

            // tool: page refresh
            tools.push({
                id: 'refresh',
                icon: 'reset',
                title: __('Refresh the page'),
                label: __('Refresh'),
                action: function() {
                    $list.datatable('refresh');
                }
            });

            // tool: manage test takers (only for unique delivery)
            if (deliveryId) {
                tools.push({
                    id: 'manage',
                    icon: 'property-advanced',
                    title: __('Manage the deliveries'),
                    label: __('Manage'),
                    action: function() {
                        location.href = manageUrl;
                    }
                });
            }

            // tool: authorise the executions
            tools.push({
                id: 'authorise',
                icon: 'play',
                title: __('Authorise the selected delivery executions'),
                label: __('Authorise'),
                massAction: true,
                action: function(selection) {
                    authorise(selection);
                }
            });

            // tool: pause the executions
            tools.push({
                id: 'pause',
                icon: 'pause',
                title: __('Pause delivery executions'),
                label: __('Pause'),
                massAction: true,
                action: function(selection) {
                    pause(selection);
                }
            });

            // tool: terminate the executions
            tools.push({
                id: 'terminate',
                icon: 'stop',
                title: __('Terminate delivery executions'),
                label: __('Terminate'),
                massAction: true,
                action: function(selection) {
                    terminate(selection);
                }
            });

            // tool: report irregularities
            tools.push({
                id: 'irregularity',
                icon: 'delivery-small',
                title: __('Report irregularities'),
                label: __('Report'),
                massAction: true,
                action: function(selection) {
                    report(selection);
                }
            });

            // action: authorise the execution
            actions.push({
                id: 'authorise',
                icon: 'play',
                title: __('Authorise the delivery execution'),
                hidden: function() {
                    var status;
                    if(this.state && this.state.status){
                        status = _status.getStatusByCode(this.state.status);
                        return !status || status.can.authorize !== true;
                    }
                    return true;
                },
                action: function(id) {
                    authorise([id]);
                }
            });

            // action: pause the execution
            actions.push({
                id: 'pause',
                icon: 'pause',
                title: __('Pause the delivery execution'),
                hidden: function() {
                    var status;
                    if(this.state && this.state.status){
                        status = _status.getStatusByCode(this.state.status);
                        return !status || status.can.pause !== true;
                    }
                    return true;
                },
                action: function(id) {
                    pause([id]);
                }
            });

            // action: terminate the execution
            actions.push({
                id: 'terminate',
                icon: 'stop',
                title: __('Terminate the delivery execution'),
                hidden: function() {
                    var status;
                    if(this.state && this.state.status){
                        status = _status.getStatusByCode(this.state.status);
                        return !status || status.can.terminate !== true;
                    }
                    return true;
                },
                action: function(id) {
                    terminate([id]);
                }
            });

            // action: report irregularities
            actions.push({
                id: 'irregularity',
                icon: 'delivery-small',
                title: __('Report irregularities'),
                action: function(id) {
                    report([id]);
                }
            });

            // column: delivery (only for all deliveries view)
            if (!deliveryId) {
                model.push({
                    id: 'delivery',
                    label: __('Delivery'),
                    transform: function(value, row) {
                        var delivery = row && row.delivery;
                        if (delivery) {
                            delivery.url = helpers._url('monitoring', 'Delivery', 'taoProctoring', {delivery : delivery.uri, testCenter : testCenterId});
                            value = deliveryLinkTpl(delivery);
                        }
                        return value;

                    }
                });
            }

            // column: test taker first name
            model.push({
                id: 'firstname',
                label: __('First name'),
                transform: function(value, row) {
                    return row && row.testTaker && row.testTaker.firstName || '';

                }
            });

            // column: test taker last name
            model.push({
                id: 'lastname',
                label: __('Last name'),
                transform: function(value, row) {
                    return row && row.testTaker && row.testTaker.lastName || '';

                }
            });

            // column: test taker identifier
            model.push({
                id: 'identifier',
                label: __('Identifier'),
                transform: function(value, row) {
                    return row && row.testTaker && row.testTaker.id || '';
                }
            });

            // column: delivery execution status
            model.push({
                id: 'status',
                label: __('Status'),
                transform: function(value, row) {
                    if(row && row.state && row.state.status){
                        var status = _status.getStatusByCode(row.state.status);
                        if(status){
                            return status.label;
                        }
                    }
                    return '';
                }
            });

            // column: delivery execution progress
            model.push({
                id: 'progress',
                label: __('Progress'),
                transform: function(value, row) {
                    var state = row && row.state;
                    var item = state && state.item;
                    var time = item && item.time;
                    if (time && time.elapsed) {
                        time.elapsedStr = _timerFormat(time.elapsed);
                        time.totalStr = _timerFormat(time.total);
                        time.display = !!(time.elapsedStr || time.totalStr);
                    }
                    return itemProgressTpl(state);
                }
            });

            // renders the datatable
            $list
                .on('query.datatable', function() {
                    loadingBar.start();
                })
                .on('load.datatable', function() {
                    loadingBar.stop();
                })
                .datatable({
                    url: deliveryId ? serviceUrl : serviceAllUrl,
                    status: {
                        empty: __('No delivery executions'),
                        available: __('Current delivery executions'),
                        loading: __('Loading')
                    },
                    tools: tools,
                    actions: actions,
                    model: model,
                    selectable: true
                }, dataset);
        }
    };

    return proctorDeliveryIndexCtlr;
});
