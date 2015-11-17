/*
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
 *
 */
define(['lodash', 'i18n'], function(_, __){
    
   var _status = {
        awaiting : {
            code : 'AWAITING',
            label : __('Awaiting'),
            can : {
                authorize : true,
                pause : __('not in progress'),
                terminate : true,
                report : true
            }
        },
        authorized : {
            code : 'AUTHORIZED',
            label : __('Authorized but not started'),
            can : {
                authorize : __('already authorized'),
                pause : __('not started'),//not in progress
                terminate :true,
                report : true
            }
        },
        inprogress : {
            code : 'INPROGRESS',
            label : __('In Progress'),
            can : {
                authorize : __('already authorized'),
                pause : true,
                terminate :true,
                report : true
            }
        },
        paused : {
            code : 'PAUSED',
            label : __('Paused'),
            can : {
                authorize : __('is paused'),
                pause : __('is already paused'),
                terminate :true,
                report : true
            }
        },
        completed : {
            code : 'COMPLETED',
            label : __('Completed'),
            can : {
                authorize : __('is completed'),
                pause : __('is completed'),
                terminate : __('is completed'),
                report : true
            }
        },
        terminated : {
            code : 'TERMINATED',
            label : __('Terminated'),
            can : {
                authorize : __('is terminated'),
                pause : __('is terminated'),
                terminate : __('is terminated'),
                report : true
            }
        }
    };
    
    function getStatus(statusName){
        return _status[statusName];
    }
    
    function getStatusByCode(statusCode){
        return _.find(_status, {code : statusCode});
    }
    
    return {
        getStatus : getStatus,
        getStatusByCode : getStatusByCode
    };
});

