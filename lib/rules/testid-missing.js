const path = require('path');

const defaultComponents = [
  "TextInput",
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableNativeFeedback",
  "Pressable",
];

module.exports = {
  meta: {
    fixable: "code",
    type: "suggestion",
    docs: {
      description: "Enforces the presence of a 'testID' prop on certain components",
      category: "Best Practices",
      recommended: false,
    },
    schema: [
      {
        type: "object",
        properties: {
          disableDefaultComponents: {
            type: "array",
            items: {
              type: "string",
            },
          },
          enableComponents: {
            type: "array",
            items: {
              type: "string",
            },
          },
          propName: {
            type: "string",
          },
        },
        additionalProperties: false,
      },
    ],
  },
  create(context) {
    const options = context.options[0] || {};
    const {
      disableDefaultComponents = [],
      enableComponents = [],
      propName = "testID",
    } = options;

    const fileName = path.basename(context.getFilename(), path.extname(context.getFilename()));
    const hyphenatedFileName = fileName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
    return {
      JSXOpeningElement({ name, attributes }) {
        const componentName = name.name;
        const hyphenatedComponentName = componentName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

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
              fix: (fixer) => {
                const lastAttribute = attributes[attributes.length - 1];
                const insertText = ` ${propName}='${hyphenatedFileName}-BEHAVIOR-${hyphenatedComponentName}'`;
                return fixer.insertTextAfter(lastAttribute, insertText);
              },
            });
          }
        }
      },
    };
  },
};
