import { readFile } from "node:fs/promises";

import ts from "typescript";

import { CONFIG_VAR_NAME } from "../../constants";

export const extractMain = async (filepath: string): Promise<string> => {
	const originalSource = await readFile(filepath, "utf8");
	const sourceFile = ts.createSourceFile(filepath, originalSource, ts.ScriptTarget.Latest);

	const findDefineUserScriptExpression = (source: ts.Node): ts.CallExpression | undefined => {
		if (ts.isExportAssignment(source)) {
			const expr = source.expression;
			if (
				ts.isCallExpression(expr) &&
				ts.isIdentifier(expr.expression) &&
				expr.expression.text === "defineUserScript"
			) {
				return expr;
			}
		}

		return ts.forEachChild(source, findDefineUserScriptExpression);
	};

	const findMainFunction = (defineUserScriptArgument: ts.ObjectLiteralExpression) => {
		for (const prop of defineUserScriptArgument.properties) {
			const propName =
				prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))
					? prop.name.text
					: undefined;

			if (propName !== "main") {
				continue;
			}

			/**
			 * main: () => { ... }
			 * or
			 * main: function () { ... })
			 */
			if (ts.isPropertyAssignment(prop)) {
				return prop.initializer.getFullText(sourceFile);
			}

			/**
			 * Method Declaration (e.g. main() { ... })
			 */
			if (ts.isMethodDeclaration(prop)) {
				if (!prop.body) {
					throw new Error("main method has no body.");
				}

				// Convert the method declaration to a function expression.
				const funcExpr = ts.factory.createFunctionExpression(
					undefined,
					undefined,
					undefined,
					prop.typeParameters,
					prop.parameters,
					prop.type,
					prop.body,
				);

				const tempPrinter = ts.createPrinter();
				return tempPrinter.printNode(ts.EmitHint.Expression, funcExpr, sourceFile);
			}
		}

		return;
	};

	const findConfigLiteral = (defineUserScriptArgument: ts.ObjectLiteralExpression) => {
		for (const prop of defineUserScriptArgument.properties) {
			const propName =
				prop.name && (ts.isIdentifier(prop.name) || ts.isStringLiteral(prop.name))
					? prop.name.text
					: undefined;

			if (propName !== "config") {
				continue;
			}

			if (!ts.isPropertyAssignment(prop)) {
				throw new Error("Invalid config defined.");
			}

			const configLiteral = prop.initializer;

			return configLiteral.getText(sourceFile);
		}

		return;
	};

	const defineUserScriptExpression = findDefineUserScriptExpression(sourceFile);
	const defineUserScriptArgument = defineUserScriptExpression?.arguments[0];
	if (!defineUserScriptArgument || !ts.isObjectLiteralExpression(defineUserScriptArgument)) {
		throw new Error("Scripts must export defineUserScript.");
	}

	const mainFunctionText = findMainFunction(defineUserScriptArgument);
	if (!mainFunctionText) {
		throw new Error("No main function found in defineUserScript export.");
	}

	const configLiteral = findConfigLiteral(defineUserScriptArgument);

	const statementsWithoutTheExport = sourceFile.statements.filter((statement) => {
		if (ts.isExportAssignment(statement)) {
			const expr = statement.expression;
			if (
				ts.isCallExpression(expr) &&
				ts.isIdentifier(expr.expression) &&
				expr.expression.text === "defineUserScript"
			) {
				return false;
			}
		}
		return true;
	});

	const updatedSourceFile = ts.factory.updateSourceFile(sourceFile, statementsWithoutTheExport);
	const printer = ts.createPrinter();
	const codeWithoutExport = printer.printFile(updatedSourceFile);

	const iifeText = `void (${mainFunctionText.trim()})(${configLiteral ? CONFIG_VAR_NAME : ""});`;

	return [
		codeWithoutExport.trim(),
		configLiteral ? `const ${CONFIG_VAR_NAME} = ${configLiteral.trim()}` : undefined,
		iifeText,
	]
		.filter((s) => s)
		.join("\n\n");
};
