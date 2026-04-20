/** @odoo-module **/

import { patch } from '@web/core/utils/patch';
import { StaticList } from '@web/model/relational_model/static_list';

const DUPLICATE_CTX_KEY = 'duplicate_one2many_record';

patch(StaticList.prototype, {
    addNewRecord(params) {
        const result = super.addNewRecord(params);
        if (params?.context?.[DUPLICATE_CTX_KEY]) {
            return result.then(async (newRecord) => {
                await newRecord.update({});
                delete params.context[DUPLICATE_CTX_KEY];
                return newRecord;
            });
        }
        return result;
    },
});
