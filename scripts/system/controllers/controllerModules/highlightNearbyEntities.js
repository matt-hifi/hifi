"use strict";

//  highlightNearbyEntities.js
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html


/* global Script, Controller, RIGHT_HAND, LEFT_HAND, MyAvatar, getGrabPointSphereOffset,
   makeRunningValues, Entities, enableDispatcherModule, disableDispatcherModule, makeDispatcherModuleParameters,
   PICK_MAX_DISTANCE, COLORS_GRAB_SEARCHING_HALF_SQUEEZE, COLORS_GRAB_SEARCHING_FULL_SQUEEZE, COLORS_GRAB_DISTANCE_HOLD,
   DEFAULT_SEARCH_SPHERE_DISTANCE, getGrabbableData, makeLaserParams, entityIsCloneable
*/

(function () {
    Script.include("/~/system/libraries/controllerDispatcherUtils.js");
    Script.include("/~/system/libraries/controllers.js");
    Script.include("/~/system/libraries/cloneEntityUtils.js");
    var dispatcherUtils = Script.require("/~/system/libraries/controllerDispatcherUtils.js");

    function differenceInArrays(firstArray, secondArray) {
        print("first " + firstArray);
        print("second " + secondArray);
        var differenceArray = firstArray.filter(function(element) {
            return secondArray.indexOf(element) < 0;
        });

        return differenceArray;
    }

    function HighlightNearbyEntities(hand) {
        this.hand = hand;
        this.otherHand = hand === dispatcherUtils.RIGHT_HAND ? dispatcherUtils.LEFT_HAND :
            dispatcherUtils.RIGHT_HAND;
        this.highlightedEntities = [];

        this.parameters = dispatcherUtils.makeDispatcherModuleParameters(
            480,
            this.hand === dispatcherUtils.RIGHT_HAND ? ["rightHand"] : ["leftHand"],
            [],
            100);


        this.isGrabable = function(controllerData, props) {
            if (dispatcherUtils.entityIsGrabbable(props) || entityIsCloneable(props)) {
                // if we've attempted to grab a child, roll up to the root of the tree
                var groupRootProps = dispatcherUtils.findGroupParent(controllerData, props);
                if (dispatcherUtils.entityIsGrabbable(groupRootProps)) {
                    return true;
                }
                return true;
            }
            return false;
        };

        this.hasHyperLink = function(props) {
            return (props.href !== "" && props.href !== undefined);
        };

        this.getOtherModule = function() {
            var otherModule = this.hand === dispatcherUtils.RIGHT_HAND ? leftHighlightNearbyEntities :
                rightHighlightNearbyEntities;
            return otherModule;
        };

        this.getOtherHandHighlightedEntities = function() {
            return this.getOtherModule().highlightedEntities;
        };

        this.highlightEntities = function(controllerData) {
            var nearbyEntitiesProperties = controllerData.nearbyEntityProperties[this.hand];
            var otherHandHighlightedEntities = this.getOtherHandHighlightedEntities();
            var newHighlightedEntities = [];
            var sensorScaleFactor = MyAvatar.sensorToWorldScale;
            for (var i = 0; i < nearbyEntitiesProperties.length; i++) {
                var props = nearbyEntitiesProperties[i];
                if (props.distance > dispatcherUtils.NEAR_GRAB_RADIUS * sensorScaleFactor) {
                    continue;
                }
                if (this.isGrabable(controllerData, props) || this.hasHyperLink(props)) {
                    dispatcherUtils.highlightTargetEntity(props.id);
                    newHighlightedEntities.push(props.id);
                }
            }

            var unhighlightEntities = differenceInArrays(this.highlightedEntities, newHighlightedEntities);

            unhighlightEntities.forEach(function(entityID) {
                if (otherHandHighlightedEntities.indexOf(entityID) < 0 ) {
                    dispatcherUtils.unhighlightTargetEntity(entityID);
                }
            });
            this.highlightedEntities = newHighlightedEntities;
        };

        this.isReady = function(controllerData) {
            this.highlightEntities(controllerData);
            return dispatcherUtils.makeRunningValues(false, [], []);
        };

        this.run = function(controllerData) {
            return this.isReady(controllerData);
        };
    }

    var leftHighlightNearbyEntities = new HighlightNearbyEntities(dispatcherUtils.LEFT_HAND);
    var rightHighlightNearbyEntities = new HighlightNearbyEntities(dispatcherUtils.RIGHT_HAND);

    dispatcherUtils.enableDispatcherModule("LeftHighlightNearbyEntities", leftHighlightNearbyEntities);
    dispatcherUtils.enableDispatcherModule("RightHighlightNearbyEntities", rightHighlightNearbyEntities);

    function cleanup() {
        dispatcherUtils.disableDispatcherModule("LeftHighlightNearbyEntities");
        dispatcherUtils.disableDispatcherModule("RightHighlightNearbyEntities");
    }

    Script.scriptEnding.connect(cleanup);
}());
