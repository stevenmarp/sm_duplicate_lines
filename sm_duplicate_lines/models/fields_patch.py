from odoo.fields import Field

_original_get_description = Field.get_description


def _patched_get_description(self, env, *args, **kwargs):
    desc = _original_get_description(self, env, *args, **kwargs)
    attributes = kwargs.get('attributes')
    if not attributes and len(args) > 0:
        attributes = args[0]
    if attributes is None or 'copy' in attributes:
        desc['copy'] = self.copy
    return desc


Field.get_description = _patched_get_description
