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
    type: "suggestion",
    docs: {
      description: "Enforces the presence of a 'testID' prop on certain components",
      category: "Best Practices",
      recommended: false,
    },
    fixable: "code",
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
          applyFix: {
            type: "boolean",
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
      applyFix = true,
    } = options;

    const filteredDefaultComponents = defaultComponents.filter(
      (component) => !disableDefaultComponents.includes(component)
    );
    const mergedAllowedComponents = [
      ...filteredDefaultComponents,
      ...enableComponents,
    ];

    return {
      JSXOpeningElement(node) {
        const componentName = node.name?.name ?? "";

        if (mergedAllowedComponents.includes(componentName)) {
          const hasTestIDAttribute = node.attributes.some(
            (attribute) => attribute.name?.name === propName
          );

          if (!hasTestIDAttribute) {
            // Extract text content inside the component
            const textContentNode = node.parent.children.find(
              (child) => child.type === "JSXText"
            );
            const textContent = textContentNode
              ? textContentNode.value.trim().toLowerCase().replace(/\s+/g, '-')
              : "default";

            const fileName = path.basename(context.getFilename(), path.extname(context.getFilename()));
            const formattedFileName = fileName.toLowerCase().replace(/\s+/g, '-');
            const formattedComponentName = componentName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

            if (!applyFix) {
              context.report({
                node,
                message: `Missing '${propName}' attribute in ${componentName} component.`,
              });
            } else {
              context.report({
                node,
                message: `Missing '${propName}' attribute in ${componentName} component.`,
                fix: (fixer) => {
                  const lastAttribute = node.attributes[node.attributes.length - 1];
                  const insertText = ` ${propName}={'${formattedFileName}_${formattedComponentName}_${textContent}'}`;
                  return fixer.insertTextAfter(lastAttribute, insertText);
                },
              });
            }
          }
        }
      },
    };
  },
};
