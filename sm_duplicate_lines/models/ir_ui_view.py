import inspect

from odoo import api, models


class Base(models.AbstractModel):
    _inherit = 'base'

    @api.model
    def _get_view_field_attributes(self):
        attributes = super()._get_view_field_attributes()
        if 'copy' not in attributes:
            attributes.append('copy')
        return attributes

    def _apply_onchange_methods(self, field_name, result, *args, **kwargs):
        if self.env.context.get('duplicate_one2many_record'):
            return None
        method = super()._apply_onchange_methods
        try:
            inspect.signature(method).bind(field_name, result, *args, **kwargs)
        except TypeError:
            return method(field_name, result)
        return method(field_name, result, *args, **kwargs)
