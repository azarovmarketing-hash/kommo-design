define([
    '../nested_model.js?v=' + sensei_widget_version,
    './process_starts/collection.js?v=' + sensei_widget_version,
    './set_sequence/collection.js?v=' + sensei_widget_version,
    './additional_filters/collection.js?v=' + sensei_widget_version,
], function(
    NestedModel,
    ProcessStartsCollection,
    SequenceCollection,
    FiltersCollection,
){
    return NestedModel.extend({
        nested: {
            process_starts: ProcessStartsCollection,
            set_sequence: SequenceCollection,
            additional_filters: FiltersCollection,
        },

        defaults: {
            amo_filter: '', 
            set_sequence: [],
            additional_filters: [],
            process_starts: [],
        },

    });
});