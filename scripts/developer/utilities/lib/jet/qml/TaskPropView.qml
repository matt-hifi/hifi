//
//  jet/TaskListView.qml
//
//  Created by Sam Gateau, 2018/05/09
//  Copyright 2018 High Fidelity, Inc.
//
//  Distributed under the Apache License, Version 2.0.
//  See the accompanying file LICENSE or http://www.apache.org/licenses/LICENSE-2.0.html
//

import QtQuick 2.7
import QtQuick.Controls 1.4 as Original
import QtQuick.Controls.Styles 1.4

import stylesUit 1.0
import controlsUit 1.0 as HifiControls

import "../../prop" as Prop

import "../jet.js" as Jet

Prop.PropGroup {
    
    id: root;
    
    property var rootConfig : Render
    property var jobPath: ""
    property alias label: root.label

    Component.onCompleted: {
        var props = Jet.job_propKeys(rootConfig.getConfig(jobPath));
        console.log(JSON.stringify(props));
        for (var p in props) {
            root.propItems.push({"object": rootConfig.getConfig(jobPath), "property":props[p] })
        }
        root.updatePropItems();
    }
        
 
}