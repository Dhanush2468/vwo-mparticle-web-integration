function prependSource (name) {
    return `mparticle.${name}`;
}

function formatAttributes(attributes) {
    var formattedAttributes = {};
    for (var key in attributes) {
        var sanitisedAttributeKey = prependSource(key);
        formattedAttributes[sanitisedAttributeKey] = attributes[key]
    }
    return formattedAttributes;
}

module.exports = {
    formatAttributes,
    prependSource
}