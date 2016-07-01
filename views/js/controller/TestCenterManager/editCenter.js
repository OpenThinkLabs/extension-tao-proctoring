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
define([
    'jquery',
    'lodash',
    'i18n',
    'layout/loading-bar',
    'ui/feedback',
    'taoProctoring/component/eligibilityEditor',
    'taoProctoring/component/eligibilityTable',
    'taoProctoring/provider/eligibility'
], function( $, _, __, loadingBar, feedback, eligibilityEditor, eligibilityTableFactory, eligibilityProvider ){
'use strict';

    /**
     * The CSS scope
     * @type {String}
     */
    var cssScope = '.eligible-deliveries';

    /**
     * Format the raw eligibility from the dataset to the expected format for the eligibility editor
     *
     * @param {Object} dataset
     * @returns {Array}
     */
    function formatEligibilities(eligibilities){
        return _.map(eligibilities, function(eligibility){
            return {
                delivery : eligibility.delivery.uri,
                testTakers : eligibility.testTakers
            };
        });
    }

    /**
     * Controls the test center manager screen
     *
     * @type {Object}
     */
    var editCenterCtlr = {
        /**
         * Entry point of the page
         */
        start : function start(){

            var eligibilityTable;
            var $container = $(cssScope);
            var $tableContainer = $('.eligibility-table-container', $container);
            var $editorContainer = $('.eligibility-editor-container', $container);

            //get the test center id from the DOM
            var testCenterId = $container.data('testcenter');

            /**
             * Start the loading bar
             */
            var loading = function loading(){
                loadingBar.start();
            };

            /**
             * Stop the loading bar
             */
            var loaded = function loaded(){
                loadingBar.stop();
            };

            /**
             * Handle errors
             * @param {Error} err - the error to handle
             */
            var handleError = function handleError(err){
                loaded();
                if(_.isError(err)){
                    feedback().error(err.message);
                } else {
                    feedback().error(err);
                }
            };

            /**
             * Handle successful operations
             * @param {String} message - the message to display
             */
            var success = function success(message){
                loaded();
                feedback().success(__('Eligible delivery removed'));
                eligibilityTable.trigger('reload');
            };

            //setup the eligibility table
            eligibilityTable =
              eligibilityTableFactory(testCenterId)
                .on('loading', loading)
                .on('loaded', loaded)
                .on('add', function handleAddAction(eligibilities){
                    var self = this;

                    //show the editor to select deliveries and test takers
                    eligibilityEditor
                        .init($editorContainer, formatEligibilities(eligibilities))
                        .on('ok', function(eligibility){

                            //then inform the server
                            loading();
                            eligibilityProvider(testCenterId)
                                .addEligibilities(eligibility)
                                .then(function(response){

                                    loaded();
                                    if(response.failed && response.failed.length){
                                        feedback().warning(__('The following delivery(ies) are already eligible : ') + response.failed.join(', '));
                                    } else {
                                        feedback().success(__('New eligible delivery added'));
                                    }
                                    self.trigger('reload');
                                })
                                .catch(handleError);
                        });
                })
                .on('edit', function handleEditAction(eligibilityId, eligibilities) {

                    //show the editor to edit  test takers
                    var eligibility = _.find(eligibilities, { uri : eligibilityId });
                    eligibilityEditor
                        .init($editorContainer, formatEligibilities(eligibilities), eligibility.delivery)
                        .on('ok', function(updated){

                            loading();
                            eligibilityProvider(testCenterId)
                                .editEligibility(updated)
                                .then(function(response){
                                    success(__('Eligible test takers updated'));
                                })
                                .catch(handleError);
                        });
                })

                .on('remove', function handleRemoveAction(eligibilityId, eligibilities) {
                    var eligibility = _.find(eligibilities, { uri : eligibilityId });

                    loading();
                    eligibilityProvider(testCenterId)
                        .removeEligibility({
                            deliveries: [eligibility.delivery.uri]
                        })
                        .then(function(){
                            success(__('Eligible delivery removed'));
                        })
                        .catch(handleError);
                })

                .on('shield', function handleShieldAction(eligibilityId) {
                    loading();
                    eligibilityProvider(testCenterId)
                        .shieldEligibility(eligibilityId)
                        .then(function(){
                            success(__('Eligibility needs proctor authorization'));
                        })
                        .catch(handleError);
                })

                .on('unshield', function handleUnshieldAction(eligibilityId) {
                    loading();
                    eligibilityProvider(testCenterId)
                        .unshieldEligibility(eligibilityId)
                        .then(function(){
                            success(__('Eligibility don\'t need proctor authorization any more.'));
                        })
                        .catch(handleError);
                })
                .init({})
                .render($tableContainer);
        }
    };

    return editCenterCtlr;
});
