const defaultComponents = [
  "TextInput",
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableNativeFeedback",
  "Pressable",
];

module.exports = {
  rules: {
    "testid-missing": {
      create(context) {
        const options = context.options[0] || {};
        const { disableDefaultComponents = [], enableComponents = [], propName = 'testID'} =
          options;

        return {
          JSXOpeningElement({ name, attributes }) {
            const componentName = name.name;

            const filteredDefaultComponents = defaultComponents.filter(
              (component) => !disableDefaultComponents.includes(component)
            );
            const mergedAllowedComponents = [
              ...filteredDefaultComponents,
              ...enableComponents,
            ];
            if (mergedAllowedComponents.includes(componentName)) {
              const hasTestIDAttribute = attributes.some(
                (attribute) => attribute.name?.name === propName
              );

              if (!hasTestIDAttribute) {
                context.report({
                  node: name,
                  message: `Missing '${propName}' attribute in ${componentName} component.`,
                });
              }
            }
          },
        };
      },
    },
  },
};
