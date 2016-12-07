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
    'i18n',
    'helpers',
    'layout/loading-bar',
    'ui/listbox',
    'taoProctoring/component/breadcrumbs',
    'taoProctoring/helper/textConverter',
], function ($, __, helpers, loadingBar, listBox, breadcrumbsFactory, textConverter) {
    'use strict';

    /**
     * The CSS scope
     * @type {String}
     */
    var cssScope = '.diagnostic-deliveries';

    // the page is always loading data when starting
    loadingBar.start();

    /**
     * Controls the taoProctoring index page
     *
     * @type {Object}
     */
    return {
        /**
         * Entry point of the page
         */
        start : function start() {

            textConverter().then(function(labels) {

                var $container = $(cssScope);
                var boxes = $container.data('list');
                var crumbs = $container.data('breadcrumbs');
                var list = listBox({
                    title: __('Available Deliveries'),
                    textEmpty: __("No Deliveries available"),
                    textNumber: __("Available"),
                    textLoading: __("Loading"),
                    renderTo: $container.find('.content'),
                    replace: true
                });
                var bc = breadcrumbsFactory($container, crumbs);
                var serviceUrl = helpers._url('deliveriesByProctor', 'Diagnostic', 'taoProctoring');

                // update the index from a JSON array
                var update = function(boxes) {
                    list.update(boxes);
                    loadingBar.stop();
                };

                // refresh the index
                var refresh = function() {
                    loadingBar.start();
                    list.setLoading(true);

                    $.ajax({
                        url: serviceUrl,
                        cache: false,
                        dataType : 'json',
                        type: 'GET'
                    }).done(function(response) {
                        boxes = response && response.list;
                        update(boxes);
                    });
                };

                if (!boxes) {
                    refresh();
                } else {
                    update(boxes);
                }

            }).catch(function (err) {
                console.log(err);
            });
        }
    };

});
