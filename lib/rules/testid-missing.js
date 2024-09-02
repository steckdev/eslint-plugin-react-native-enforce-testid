const path = require("path");

const defaultComponents = [
  "TextInput",
  "TouchableOpacity",
  "TouchableHighlight",
  "TouchableNativeFeedback",
  "Pressable",
];

function toKebabCase(value) {
  return value
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getPriorityValue(attributes, children) {
  const attributeMapping = ["id", "name", "label"];

  for (const attr of attributeMapping) {
    const attribute = attributes.find(
      (a) => a.name?.name === attr && typeof a.value?.value === "string",
    );
    if (attribute) {
      return attribute.value.value;
    }
  }

  const textContentNode = children.find((child) => child.type === "JSXText");
  return textContentNode ? textContentNode.value.trim() : "default";
}

module.exports = {
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Enforces the presence of a 'testID' prop on certain components with BEM formatting.",
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
      (component) => !disableDefaultComponents.includes(component),
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
            (attribute) => attribute.name?.name === propName,
          );

          if (!hasTestIDAttribute) {
            if (!applyFix) {
              context.report({
                node,
                message: `Missing '${propName}' attribute in ${componentName} component.`,
              });
            } else {
              const priorityValue = getPriorityValue(
                node.attributes,
                node.parent.children,
              );

              context.report({
                node,
                message: `Missing or improperly formatted '${propName}' attribute in ${componentName} component.`,
                fix: (fixer) => {
                  const fileName = path.basename(
                    context.getFilename(),
                    path.extname(context.getFilename()),
                  );
                  const formattedFileName = toKebabCase(fileName);
                  const formattedComponentName = toKebabCase(componentName);
                  const formattedModifier = toKebabCase(priorityValue);

                  const testIDValue = `${formattedFileName}_${formattedComponentName}_${formattedModifier}`;

                  const lastAttribute =
                    node.attributes[node.attributes.length - 1];
                  return fixer.insertTextAfter(
                    lastAttribute,
                    ` ${propName}={'${testIDValue}'}`,
                  );
                },
              });
            }
          }
        }
      },
    };
  },
};
