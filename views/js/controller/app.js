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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */
/**
 * @author Jean-Sébastien Conan <jean-sebastien@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'controller/app',
    'core/dataProvider/request',
    'ui/container',
    'ui/breadcrumbs',
    'util/url'
], function ($, _, appController, request, containerFactory, breadcrumbsFactory, urlHelper) {
    'use strict';

    var breadcrumbsUrl = urlHelper.route('load', 'Breadcrumbs', 'taoProctoring');
    var indexUrl = urlHelper.route('index', 'DeliverySelection', 'taoProctoring');
    var monitorUrl = urlHelper.route('index', 'Monitor', 'taoProctoring');
    var historyUrl = urlHelper.route('index', 'Reporting', 'taoProctoring');
    var knownRoutes = [{
        url: indexUrl,
        params: []
    }, {
        url: monitorUrl,
        params: ['delivery']
    }, {
        url: historyUrl,
        params: ['delivery', 'session']
    }];

    /**
     * Gets the list of routes that lead to the provided route
     * @param {String} route
     * @returns {String[]}
     */
    function getRoutes(route) {
        var routes = [];
        var parsed = urlHelper.parse(route);

        _.forEach(knownRoutes, function (knownRoute) {
            var url = urlHelper.parse(knownRoute.url);
            var params = {};

            if (parsed.path === url.path) {
                routes.push(route);
                return false;
            }

            _.forEach(knownRoute.params, function (param) {
                if (parsed.query[param]) {
                    params[param] = decodeURIComponent(parsed.query[param]);
                }
            });

            routes.push(urlHelper.build(knownRoute.url, params));
        });
        return routes;
    }

    /**
     * The app controller takes care of the application navigation and routing.
     */
    return _.defaults({
        /**
         * App controller entry point: set up the router.
         */
        start: function start() {
            var toolbox = containerFactory('.header');
            var breadcrumbs = breadcrumbsFactory({
                renderTo: toolbox.getElement(),
                replace: true,
                cls: 'action-bar horizontal-action-bar'
            });

            appController
                .on('change.breadcrumbs', function (route) {
                    var routes = getRoutes(route);
                    request(breadcrumbsUrl, {route: routes}, 'POST').then(function (data) {
                        breadcrumbs.update(data);
                    });
                })
                .apply('a', toolbox.getElement())
                .start();
        }
    }, appController);
});
