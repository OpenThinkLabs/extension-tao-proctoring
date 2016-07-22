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
    'jquery',
    'lodash',
    'i18n',
    'helpers',
    'layout/loading-bar',
    'util/encode',
    'moment',
    'taoProctoring/component/dateRange',
    'taoProctoring/component/history/historyTable',
    'taoProctoring/component/breadcrumbs',
    'ui/datatable'
], function ($, _, __, helpers, loadingBar, encode, moment, dateRangeFactory, historyTableFactory, breadcrumbsFactory) {
    'use strict';

    /**
     * The CSS scope
     * @type {String}
     */
    var cssScope = '.session-history';

    // the page is always loading data when starting
    loadingBar.start();

    /**
     * Controls the taoProctoring session history page
     *
     * @type {Object}
     */
    var taoProctoringReportCtlr = {
        /**
         * Entry point of the page
         */
        start : function start() {
            var $container = $(cssScope);
            var dataset = $container.data('set');
            var testCenterId = $container.data('testcenter');
            var sessions = $container.data('sessions');
            var serviceUrl = helpers._url('history', 'Reporting', 'taoProctoring', {testCenter : testCenterId, session: sessions});
            var today = moment().format('YYYY-MM-DD');

            var historyTable = historyTableFactory({
                service: serviceUrl,
                params: {
                    periodStart : today,
                    periodEnd : today
                },
                renderTo: $container.find('.list')
            }, dataset);

            breadcrumbsFactory($container, $container.data('breadcrumbs'));

            dateRangeFactory({
                start : today,
                end : today,
                renderTo: $container.find('.panel')
            }).on('change submit', function() {
                historyTable.refresh({
                    periodStart : this.getStart(),
                    periodEnd : this.getEnd()
                });
            });
        }
    };

    return taoProctoringReportCtlr;
});
