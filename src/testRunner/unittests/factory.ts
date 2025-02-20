import * as ts from "../_namespaces/ts";
import { setEnableDeprecationWarnings } from "../../deprecatedCompat/deprecate";

describe("unittests:: FactoryAPI", () => {
    function assertSyntaxKind(node: ts.Node, expected: ts.SyntaxKind) {
        assert.strictEqual(node.kind, expected, `Actual: ${ts.Debug.formatSyntaxKind(node.kind)} Expected: ${ts.Debug.formatSyntaxKind(expected)}`);
    }
    describe("factory.createExportAssignment", () => {
        it("parenthesizes default export if necessary", () => {
            function checkExpression(expression: ts.Expression) {
                const node = ts.factory.createExportAssignment(
                    /*modifiers*/ undefined,
                    /*isExportEquals*/ false,
                    expression,
                );
                assertSyntaxKind(node.expression, ts.SyntaxKind.ParenthesizedExpression);
            }

            const clazz = ts.factory.createClassExpression(/*modifiers*/ undefined, "C", /*typeParameters*/ undefined, /*heritageClauses*/ undefined, [
                ts.factory.createPropertyDeclaration([ts.factory.createToken(ts.SyntaxKind.StaticKeyword)], "prop", /*questionOrExclamationToken*/ undefined, /*type*/ undefined, ts.factory.createStringLiteral("1")),
            ]);
            checkExpression(clazz);
            checkExpression(ts.factory.createPropertyAccessExpression(clazz, "prop"));

            const func = ts.factory.createFunctionExpression(/*modifiers*/ undefined, /*asteriskToken*/ undefined, "fn", /*typeParameters*/ undefined, /*parameters*/ undefined, /*type*/ undefined, ts.factory.createBlock([]));
            checkExpression(func);
            checkExpression(ts.factory.createCallExpression(func, /*typeArguments*/ undefined, /*argumentsArray*/ undefined));
            checkExpression(ts.factory.createTaggedTemplateExpression(func, /*typeArguments*/ undefined, ts.factory.createNoSubstitutionTemplateLiteral("")));

            checkExpression(ts.factory.createBinaryExpression(ts.factory.createStringLiteral("a"), ts.SyntaxKind.CommaToken, ts.factory.createStringLiteral("b")));
            checkExpression(ts.factory.createCommaListExpression([ts.factory.createStringLiteral("a"), ts.factory.createStringLiteral("b")]));
        });
    });

    describe("factory.createArrowFunction", () => {
        it("parenthesizes concise body if necessary", () => {
            function checkBody(body: ts.ConciseBody) {
                const node = ts.factory.createArrowFunction(
                    /*modifiers*/ undefined,
                    /*typeParameters*/ undefined,
                    [],
                    /*type*/ undefined,
                    /*equalsGreaterThanToken*/ undefined,
                    body,
                );
                assertSyntaxKind(node.body, ts.SyntaxKind.ParenthesizedExpression);
            }

            checkBody(ts.factory.createObjectLiteralExpression());
            checkBody(ts.factory.createPropertyAccessExpression(ts.factory.createObjectLiteralExpression(), "prop"));
            checkBody(ts.factory.createAsExpression(ts.factory.createPropertyAccessExpression(ts.factory.createObjectLiteralExpression(), "prop"), ts.factory.createTypeReferenceNode("T", /*typeArguments*/ undefined)));
            checkBody(ts.factory.createNonNullExpression(ts.factory.createPropertyAccessExpression(ts.factory.createObjectLiteralExpression(), "prop")));
            checkBody(ts.factory.createCommaListExpression([ts.factory.createStringLiteral("a"), ts.factory.createStringLiteral("b")]));
            checkBody(ts.factory.createBinaryExpression(ts.factory.createStringLiteral("a"), ts.SyntaxKind.CommaToken, ts.factory.createStringLiteral("b")));
        });
    });

    describe("createBinaryExpression", () => {
        it("parenthesizes arrow function in RHS if necessary", () => {
            const lhs = ts.factory.createIdentifier("foo");
            const rhs = ts.factory.createArrowFunction(
                /*modifiers*/ undefined,
                /*typeParameters*/ undefined,
                [],
                /*type*/ undefined,
                /*equalsGreaterThanToken*/ undefined,
                ts.factory.createBlock([]),
            );
            function checkRhs(operator: ts.BinaryOperator, expectParens: boolean) {
                const node = ts.factory.createBinaryExpression(lhs, operator, rhs);
                assertSyntaxKind(node.right, expectParens ? ts.SyntaxKind.ParenthesizedExpression : ts.SyntaxKind.ArrowFunction);
            }

            checkRhs(ts.SyntaxKind.CommaToken, /*expectParens*/ false);
            checkRhs(ts.SyntaxKind.EqualsToken, /*expectParens*/ false);
            checkRhs(ts.SyntaxKind.PlusEqualsToken, /*expectParens*/ false);
            checkRhs(ts.SyntaxKind.BarBarToken, /*expectParens*/ true);
            checkRhs(ts.SyntaxKind.AmpersandAmpersandToken, /*expectParens*/ true);
            checkRhs(ts.SyntaxKind.QuestionQuestionToken, /*expectParens*/ true);
            checkRhs(ts.SyntaxKind.EqualsEqualsToken, /*expectParens*/ true);
            checkRhs(ts.SyntaxKind.BarBarEqualsToken, /*expectParens*/ false);
            checkRhs(ts.SyntaxKind.AmpersandAmpersandEqualsToken, /*expectParens*/ false);
            checkRhs(ts.SyntaxKind.QuestionQuestionEqualsToken, /*expectParens*/ false);
        });
    });

    describe("deprecations", () => {
        beforeEach(() => {
            setEnableDeprecationWarnings(false);
        });

        afterEach(() => {
            setEnableDeprecationWarnings(true);
        });

        // https://github.com/microsoft/TypeScript/issues/50259
        it("deprecated createConstructorDeclaration overload does not throw", () => {
            const body = ts.factory.createBlock([]);
            assert.doesNotThrow(() => ts.factory.createConstructorDeclaration(
                /*decorators*/ undefined,
                /*modifiers*/ undefined,
                /*parameters*/ [],
                body,
            ));
        });

        // https://github.com/microsoft/TypeScript/issues/50259
        it("deprecated updateConstructorDeclaration overload does not throw", () => {
            const body = ts.factory.createBlock([]);
            const ctor = ts.factory.createConstructorDeclaration(/*modifiers*/ undefined, [], body);
            assert.doesNotThrow(() => ts.factory.updateConstructorDeclaration(
                ctor,
                ctor.decorators,
                ctor.modifiers,
                ctor.parameters,
                ctor.body,
            ));
        });
    });

});
