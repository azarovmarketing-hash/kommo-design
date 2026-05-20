define([], () => {
    const ROBOCODE_PLANNER_CONTANTS = {
        MODAL_ACTION_TYPES: {
            create: 'create',
            edit: 'edit',
            delete: 'delete'
        },
        RUN_TYPES: {
            once: 'once',
            daily: 'daily',
            weekly: 'weekly',
            monthly: 'monthly',
            last_month_day: 'last_month_day'
        }
    };

    Object.freeze(ROBOCODE_PLANNER_CONTANTS);

    return ROBOCODE_PLANNER_CONTANTS;
})