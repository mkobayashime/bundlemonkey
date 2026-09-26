import ts from "typescript";

import { CONFIG_VAR_NAME } from "../../constants";

export function hoistConfig(source: string): string {
	const sourceFile = ts.createSourceFile(
		"temp.ts",
		source,
		ts.ScriptTarget.Latest,
		true,
		ts.ScriptKind.TS,
	);

	const hoistedStatement: ts.Statement | undefined = (() => {
		for (const statement of sourceFile.statements) {
			if (ts.isVariableStatement(statement)) {
				for (const decl of statement.declarationList.declarations) {
					if (ts.isIdentifier(decl.name) && decl.name.text === CONFIG_VAR_NAME) {
						return statement;
					}
				}
			}
		}
		return;
	})();

	if (!hoistedStatement) {
		return source;
	}

	const hoistedStart = hoistedStatement.getStart();
	const hoistedEnd = hoistedStatement.getEnd();
	const hoistedText = source.substring(hoistedStart, hoistedEnd);

	const remainingText = source.substring(0, hoistedStart) + source.substring(hoistedEnd + 1);

	return `${hoistedText.trim()}\n\n${remainingText.trim()}`;
}
