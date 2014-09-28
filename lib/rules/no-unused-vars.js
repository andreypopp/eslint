/**
 * @fileoverview Rule to flag declared but unused variables
 * @author Ilya Volodin
 */

"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = function(context) {

    var config = {
        vars: "all",
        args: "after-used"
    };

    if (context.options[0]) {
        if (typeof(context.options[0]) === "string") {
            config.vars = context.options[0];
        } else {
            config.vars = context.options[0].vars || config.vars;
            config.args = context.options[0].args || config.args;
        }
    }

    var MESSAGE = "{{name}} is defined but never used";

    /**
     * @param {Reference} ref - an escope Reference
     * @returns {Boolean} whether the given reference represents a read operation
     */
    function isReadRef(ref) {
        return ref.isRead();
    }

    /**
     * @param {Scope} scope - an escope Scope object
     * @returns {Variable[]} most of the local variables with no read references
     */
    function unusedLocals(scope) {
        var unused = [];
        var variables = scope.variables;
        if (scope.type !== "global") {
            for (var i = 0, l = variables.length; i < l; ++i) {
                // skip function expression names
                if (scope.functionExpressionScope) {
                    continue;
                }
                // skip implicit "arguments" variable
                if (scope.type === "function" && variables[i].name === "arguments" && variables[i].identifiers.length === 0) {
                    continue;
                }
                var type = variables[i].defs[0].type;
                // skip catch variables
                if (type === "CatchClause") {
                    continue;
                }
                // if "args" option is "none", skip any parameter
                if (config.args === "none" && type === "Parameter") {
                    continue;
                }
                // if "args" option is "after-used", skip all but the last parameter
                if (config.args === "after-used" && type === "Parameter" && variables[i].defs[0].index < variables[i].defs[0].node.params.length - 1) {
                    continue;
                }
                if (variables[i].references.filter(isReadRef).length === 0) {
                    unused.push(variables[i]);
                }
            }
        }
        return [].concat.apply(unused, [].map.call(scope.childScopes, unusedLocals));
    }

    return {
        "Program": function(programNode) {
            var globalScope = context.getScope();
            var unused = unusedLocals(globalScope);
            var i, l;

            // determine unused globals
            if (config.vars === "all") {
                var unresolvedRefs = globalScope.through.filter(isReadRef).map(function(ref) {
                    return ref.identifier.name;
                });
                for (i = 0, l = globalScope.variables.length; i < l; ++i) {
                    if (unresolvedRefs.indexOf(globalScope.variables[i].name) < 0) {
                        unused.push(globalScope.variables[i]);
                    }
                }
            }
/*
<<<<<<< HEAD
    return {
        "FunctionDeclaration": populateVariables,
        "FunctionExpression": populateVariables,
        "Program": populateGlobalVariables,
        "XJSIdentifier": function(node) {
            var ancestors = context.getAncestors(node);
            var variable = findVariable(node.name);

            if (variable) {
                variable.used = true;
                markIgnorableUnusedVariables(variable, ancestors);
            }
        },
        "Identifier": function(node) {
            var ancestors = context.getAncestors(node);
            var parent = ancestors.pop();
            var grandparent = ancestors.pop();

            /*
             * if it's not an assignment expression find corresponding
             * variable in the array and mark it as used
             * /
            if ((parent.type !== "AssignmentExpression" || node !== parent.left) &&
                (parent.type !== "VariableDeclarator" || (parent.init && parent.init === node)) &&
                parent.type !== "FunctionDeclaration" &&
                !(parent.type === "MemberExpression" && parent.property === node && !parent.computed) &&
                !(parent.type === "Property" && parent.kind === "init" && parent.key === node) &&
                !(parent.type === "FunctionExpression" && functionHasParam(parent, node)) &&
                (parent.type !== "FunctionExpression" ||
                    (grandparent !== null &&
                    (grandparent.type === "CallExpression" || grandparent.type === "AssignmentExpression")))) {

                var variable = findVariable(node.name);

                if (variable) {
                    variable.used = true;
                    markIgnorableUnusedVariables(variable, ancestors);
=======
            for (i = 0, l = unused.length; i < l; ++i) {
                if (unused[i].eslintExplicitGlobal) {
                    context.report(programNode, MESSAGE, unused[i]);
                } else if (unused[i].defs.length > 0) {
                    context.report(unused[i].identifiers[0], MESSAGE, unused[i]);
>>>>>>> master-original
                }
            }
*/
        }
    };

};
