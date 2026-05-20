define([], function() {
    return function EnableFeatures() {
        let enableFeaturesData = {
            branch_analytics: false,
            dynamic_segments: false,
            element_form_extended: false,
            element_multicondition: false,
            element_splitter: false,
            marketplace: false,
            private_cloud: false,
            process_comments: false,
            process_share_link: false,
            process_versions: false,
            smart_balancer: false,
            workplaces: false,
            element_robocode: false
        }

        this.setEnableFeatures = (enableFeatures) => {
            let isChanged = false;
            for (let featureType in enableFeatures) {
                isChanged = this.changeEnableFeatures(featureType, enableFeatures[featureType]) || isChanged;
            }
            isChanged && this.triggerEvent();
            return this;
        }
    
        this.changeEnableFeatures = (type, enableFeatures) => {
            if (enableFeatures !== undefined && enableFeaturesData[type] !== enableFeatures) {
                enableFeaturesData[type] = enableFeatures;
                return true;
            }
            return false;
        }

        this.getFetureEnableStatus = (featureType) => {
            return enableFeaturesData[featureType] || false;
        }

        this.triggerEvent = () => {
            window.SENSEI.events.trigger('enable_features_change', enableFeaturesData);
        }
    }
});