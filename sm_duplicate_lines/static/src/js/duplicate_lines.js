odoo.define('sm_duplicate_lines.duplicate_lines', function (require) {
"use strict";

var ListRenderer = require('web.ListRenderer');
var FieldX2Many = require('web.relational_fields').FieldX2Many;
var time = require('web.time');

ListRenderer.include({
    events: _.extend({}, ListRenderer.prototype.events, {
        'click .o_list_record_copy': '_onCopyRecord',
    }),

    _shouldRenderDuplicateButton: function () {
        if (!this.editable || !this.activeActions.create) {
            return false;
        }
        if (this.arch.attrs.disable_lines_duplicate === "1" || (this.arch.attrs.options && this.arch.attrs.options.disable_lines_duplicate)) {
            return false;
        }
        var model = this.state.model;
        var ALLOWED_LINE_MODELS = [
            'sale.order.line',
            'purchase.order.line',
            'account.move.line',
        ];
        return ALLOWED_LINE_MODELS.includes(model);
    },

    _getNumberOfCols: function () {
        var n = this._super.apply(this, arguments);
        if (this._shouldRenderDuplicateButton()) {
            n++;
        }
        return n;
    },

    _renderHeader: function () {
        var $thead = this._super.apply(this, arguments);
        if (this._shouldRenderDuplicateButton()) {
            $thead.find('tr').append($('<th>', {class: 'o_list_record_copy_header'}));
        }
        return $thead;
    },

    _renderFooter: function () {
        var $footer = this._super.apply(this, arguments);
        if (this._shouldRenderDuplicateButton()) {
            $footer.find('tr').append($('<td>'));
        }
        return $footer;
    },

    _renderRow: function (record, index) {
        var $row = this._super.apply(this, arguments);
        if (this._shouldRenderDuplicateButton()) {
            var $icon = $('<button>', {
                'class': 'fa fa-copy o_list_record_copy',
                'title': 'Duplicate',
                'type': 'button',
            });
            var $td = $('<td>', {class: 'o_list_record_copy_td'}).append($icon);
            $row.append($td);
        }
        return $row;
    },

    _onCopyRecord: function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        var self = this;
        var $tr = $(ev.currentTarget).closest('tr');
        var recordId = $tr.data('id');
        this.unselectRow().then(function () {
            self.trigger_up('list_copy_record', { recordId: recordId });
        });
    },
});

FieldX2Many.include({
    custom_events: _.extend({}, FieldX2Many.prototype.custom_events, {
        list_copy_record: '_onListCopyRecord',
    }),

    _onListCopyRecord: function (ev) {
        ev.stopPropagation();
        var self = this;
        var recordId = ev.data.recordId;
        var record = _.findWhere(this.value.data, {id: recordId});
        if (!record) return;

        var context = _.extend({}, this.record.getContext(), record.getContext());
        var newCopyData = {
            'duplicate_one2many_record': 1,
        };

        if (record.res_id) {
            this._rpc({
                model: record.model,
                method: 'copy_data',
                args: [record.res_id],
                context: context,
            }).then(function (copyData) {
                if (copyData && copyData[0]) {
                    var values = copyData[0];
                    _.each(values, function (val, key) {
                        newCopyData['default_' + key] = val;
                    });
                    var contextToPass = _.extend({}, context, newCopyData);
                    self._setValue({
                        operation: 'CREATE',
                        position: self.editable || 'bottom',
                        context: [contextToPass],
                    });
                }
            });
        } else {
            var values = {};
            _.each(record.fields, function (fieldInfo, fieldName) {
                if (!fieldInfo.copy) return;
                
                var val = record.data[fieldName];
                if (val !== undefined) {
                    if (fieldInfo.type === 'many2one') {
                        values['default_' + fieldName] = val ? val.res_id : false;
                    } else if (fieldInfo.type === 'many2many' || fieldInfo.type === 'one2many') {
                        var ids = [];
                        if (val && val.data) {
                            _.each(val.data, function (subRec) {
                                if (subRec.res_id) {
                                    ids.push(subRec.res_id);
                                }
                            });
                        }
                        values['default_' + fieldName] = [[6, 0, ids]];
                    } else if (fieldInfo.type === 'datetime') {
                        values['default_' + fieldName] = val ? (moment.isMoment(val) ? time.datetime_to_str(val.toDate()) : val) : false;
                    } else if (fieldInfo.type === 'date') {
                        values['default_' + fieldName] = val ? (moment.isMoment(val) ? time.date_to_str(val.toDate()) : val) : false;
                    } else {
                        values['default_' + fieldName] = val;
                    }
                }
            });
            var contextToPass = _.extend({}, context, newCopyData, values);
            this._setValue({
                operation: 'CREATE',
                position: this.editable || 'bottom',
                context: [contextToPass],
            });
        }
    },
});

});
