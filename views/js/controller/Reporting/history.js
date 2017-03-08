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
 * Copyright (c) 2016 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien.conan@vesperiagroup.com>
 */
define([
    'i18n',
    'util/url',
    'controller/app',
    'layout/loading-bar',
    'ui/container',
    'util/encode',
    'taoProctoring/component/proxy',
    'taoProctoring/component/dateRange',
    'taoProctoring/component/history/historyTable',
    'tpl!taoProctoring/templates/reporting/index',
    'ui/datatable'
], function (
    __,
    urlHelper,
    appController,
    loadingBar,
    containerFactory,
    encode,
    proxyFactory,
    dateRangeFactory,
    historyTableFactory,
    indexTpl
) {
    'use strict';

    /**
     * The CSS scope
     * @type {String}
     */
    var cssScope = '.session-history';

    var serviceUrl = urlHelper.route('sessionHistory', 'Reporting', 'taoProctoring');
    var sessionsUrl = urlHelper.route('history', 'Reporting', 'taoProctoring');

    /**
     * Filters the disconnection errors
     * @param {Error} err
     */
    function handleOnDisconnect(err) {
        if (err.code === 403) {
            //we just leave if any 403 occurs
            window.location.reload(true);
        }
    }

    // the page is always loading data when starting
    loadingBar.start();

    /**
     * Controls the taoProctoring session history page
     *
     * @type {Object}
     */
    return {
        /**
         * Entry point of the page
         */
        start : function start() {
            var container = containerFactory().changeScope(cssScope).write(indexTpl());
            var currentRoute = urlHelper.parse(window.location.href);
            var deliveryId = decodeURIComponent(currentRoute.query.delivery);
            var sessions = decodeURIComponent(currentRoute.query.session).split(',');

            appController.on('change.history', function() {
                appController.off('change.history');
                container.destroy();
            });

            proxyFactory('ajax').init({
                actions: {
                    read: serviceUrl
                }
            }).then(function(proxyService) {
                return proxyService.read({delivery : deliveryId, session: sessions}).then(function(data) {
                    var detailedHistory = data.detailedHistory;
                    var historyTable = historyTableFactory({
                        tools: [{
                            id: 'show-detailed-report',
                            icon: 'insert-horizontal-line',
                            title: __('Show detailed session history messages'),
                            label: __('Show detailed report'),
                            action: function() {
                                var tool = historyTable.config.tools.find(function (val) {
                                    return val.id === 'show-detailed-report';
                                });

                                historyTable.config.params.detailed = detailedHistory = !detailedHistory;
                                tool.label = detailedHistory ? __('Show brief report') : __('Show detailed report');
                                historyTable.refresh();
                            }
                        }],
                        params: {detailed: detailedHistory, delivery : deliveryId, session: sessions},
                        service: sessionsUrl,
                        sortBy: data.sortBy,
                        sortOrder: data.sortOrder
                    }, data.set)
                        .on('loading', function() {
                            loadingBar.start();
                        })
                        .on('loaded', function() {
                            loadingBar.stop();
                        })
                        .render(container.find('.list'));

                    dateRangeFactory({
                        start : data.periodStart,
                        end : data.periodEnd,
                        renderTo: container.find('.panel')
                    }).on('change submit', function() {
                        historyTable.refresh({
                            periodStart : this.getStart(),
                            periodEnd : this.getEnd()
                        });
                    });
                });
            }).catch(function(err) {
                handleOnDisconnect(err);
                appController.onError(err);
                loadingBar.stop();
            });
        }
    };
});
