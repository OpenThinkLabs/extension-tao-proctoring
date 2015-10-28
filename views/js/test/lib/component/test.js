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
    'taoProctoring/lib/component'
], function($, _, component) {
    'use strict';

    QUnit.module('component');


    QUnit.test('module', 3, function(assert) {
        assert.equal(typeof component, 'function', "The component module exposes a function");
        assert.equal(typeof component(), 'object', "The component factory produces an object");
        assert.notStrictEqual(component(), component(), "The component factory provides a different object on each call");
    });


    var testReviewApi = [
        { name : 'init', title : 'init' },
        { name : 'destroy', title : 'destroy' },
        { name : 'render', title : 'render' },
        { name : 'show', title : 'show' },
        { name : 'hide', title : 'hide' },
        { name : 'enable', title : 'enable' },
        { name : 'disable', title : 'disable' },
        { name : 'is', title : 'is' },
        { name : 'setState', title : 'setState' },
        { name : 'getDom', title : 'getDom' }
    ];

    QUnit
        .cases(testReviewApi)
        .test('instance API ', function(data, assert) {
            var instance = component();
            assert.equal(typeof instance[data.name], 'function', 'The component instance exposes a "' + data.title + '" function');
        });


    QUnit.test('init', function(assert) {
        var config = {
            nothing: undefined,
            dummy: null,
            title: 'My Title'
        };
        var instance = component().init(config);

        assert.notEqual(instance.config, config, 'The component instance must duplicate the config set');
        assert.equal(instance.hasOwnProperty('nothing'), false, 'The component instance must not accept undefined config properties');
        assert.equal(instance.hasOwnProperty('dummy'), false, 'The component instance must not accept null config properties');
        assert.equal(instance.config.title, config.title, 'The component instance must catch the title config');
        assert.equal(instance.is('rendered'), false, 'The component instance must not be rendered');

        instance.destroy();
    });


    QUnit.test('render', function(assert) {
        var $dummy1 = $('<div class="dummy" />');
        var $dummy2 = $('<div class="dummy" />');
        var $container1 = $('#fixture-1').append($dummy1);
        var $container2 = $('#fixture-2').append($dummy2);
        var instance;

        // auto render at init
        assert.equal($container1.children().length, 1, 'The container1 already contains an element');
        assert.equal($container1.children().get(0), $dummy1.get(0), 'The container1 contains the dummy element');
        assert.equal($container1.find('.dummy').length, 1, 'The containerZ contains an element of the class dummy');

        instance = component().init({
            renderTo: $container1,
            replace: true
        });

        assert.equal($container1.find('.dummy').length, 0, 'The containerZ does not contain an element of the class dummy');
        assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
        assert.equal(typeof instance.getDom(), 'object', 'The component instance returns the rendered content as an object');
        assert.equal(instance.getDom().length, 1, 'The component instance returns the rendered content');
        assert.equal(instance.getDom().parent().get(0), $container1.get(0), 'The component instance is rendered inside the right container');

        instance.destroy();

        assert.equal($container1.children().length, 0, 'The container1 is now empty');
        assert.equal(instance.getDom(), null, 'The component instance has removed its rendered content');

        // explicit render
        assert.equal($container2.children().length, 1, 'The container2 already contains an element');
        assert.equal($container2.children().get(0), $dummy2.get(0), 'The container2 contains the dummy element');
        assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');

        instance = component().init();
        instance.render($container2);

        assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');
        assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
        assert.equal(typeof instance.getDom(), 'object', 'The component instance returns the rendered content as an object');
        assert.equal(instance.getDom().length, 1, 'The component instance returns the rendered content');
        assert.equal(instance.getDom().parent().get(0), $container2.get(0), 'The component instance is rendered inside the right container');

        instance.destroy();

        assert.equal($container2.children().length, 1, 'The component has beend removed from the container2');
        assert.equal($container2.find('.dummy').length, 1, 'The container2 contains an element of the class dummy');
        assert.equal(instance.getDom(), null, 'The component instance has removed its rendered content');
    });


    QUnit.test('show/hide', function(assert) {
        var instance = component().init();
        var $component = instance.render();

        assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
        assert.equal($component.length, 1, 'The component instance returns the rendered content');

        assert.equal(instance.is('hidden'), false, 'The component instance is visible');
        assert.equal(instance.getDom().hasClass('hidden'), false, 'The component instance does not have the hidden class');

        instance.hide();

        assert.equal(instance.is('hidden'), true, 'The component instance is hidden');
        assert.equal(instance.getDom().hasClass('hidden'), true, 'The component instance has the hidden class');

        instance.show();

        assert.equal(instance.is('hidden'), false, 'The component instance is visible');
        assert.equal(instance.getDom().hasClass('hidden'), false, 'The component instance does not have the hidden class');

        instance.destroy();
    });


    QUnit.test('enable/disable', function(assert) {
        var instance = component().init();
        var $component = instance.render();

        assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
        assert.equal($component.length, 1, 'The component instance returns the rendered content');

        assert.equal(instance.is('disabled'), false, 'The component instance is enabled');
        assert.equal(instance.getDom().hasClass('disabled'), false, 'The component instance does not have the disabled class');

        instance.disable();

        assert.equal(instance.is('disabled'), true, 'The component instance is disabled');
        assert.equal(instance.getDom().hasClass('disabled'), true, 'The component instance has the disabled class');

        instance.enable();

        assert.equal(instance.is('disabled'), false, 'The component instance is enabled');
        assert.equal(instance.getDom().hasClass('disabled'), false, 'The component instance does not have the disabled class');

        instance.destroy();
    });


    QUnit.test('state', function(assert) {
        var instance = component().init();
        var $component = instance.render();

        assert.equal(instance.is('rendered'), true, 'The component instance must be rendered');
        assert.equal($component.length, 1, 'The component instance returns the rendered content');

        assert.equal(instance.is('customState'), false, 'The component instance does not have the customState state');
        assert.equal(instance.getDom().hasClass('customState'), false, 'The component instance does not have the customState class');

        instance.setState('customState', true);

        assert.equal(instance.is('customState'), true, 'The component instance has the customState state');
        assert.equal(instance.getDom().hasClass('customState'), true, 'The component instance has the customState class');

        instance.setState('customState', false);

        assert.equal(instance.is('customState'), false, 'The component instance does not have the customState state');
        assert.equal(instance.getDom().hasClass('customState'), false, 'The component instance does not have the customState class');

        instance.destroy();
    });

});
