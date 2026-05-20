define([
    './constants.js?v=' + sensei_widget_version,
    './modals/plannerDeleteModal.js?v=' + sensei_widget_version,
    './modals/plannerEditModal.js?v=' + sensei_widget_version
], (ROBOCODE_PLANNER_CONTANTS, PlannerDeleteModal, PlannerEditModal) => {

    class RobocePlannerFactory {
        static createModal(options) {
            if (options.action === ROBOCODE_PLANNER_CONTANTS.MODAL_ACTION_TYPES.delete) {
                return new PlannerDeleteModal(options);
            }
            if (options.action === ROBOCODE_PLANNER_CONTANTS.MODAL_ACTION_TYPES.create || options.action === ROBOCODE_PLANNER_CONTANTS.MODAL_ACTION_TYPES.edit) {
                return new PlannerEditModal({ ...options, isNew: options.action === ROBOCODE_PLANNER_CONTANTS.MODAL_ACTION_TYPES.create });
            }
            console.debug("Unknown action for robocode planner modal: " + options.action);
        }
    }

    return RobocePlannerFactory;
})