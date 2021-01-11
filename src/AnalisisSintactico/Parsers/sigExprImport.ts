import { Lexer } from "../../AnalisisLexico/Lexer";
import { InfoToken } from "../../AnalisisLexico/InfoToken";
import { ErrorComun, Expect } from "../Expect";
import { ExprRes, PError, PExito } from "../ExprRes";
import { generarTextoError } from "./utilidades";
import { Asociatividad } from "../Asociatividad";
import { EObjeto } from "../Expresion/EObjeto";
import { EImport } from "../Expresion/EImport";

export function getSigExprImport(
    lexer: Lexer,
    sigExprObjeto: (
        infoArray: InfoToken<string>,
        indentacionNuevaLinea: number,
        indentacionMinima: number
    ) => ExprRes
) {

    const esperarExprObjeto = (infoArray: InfoToken<string>) => {
        const exprObjeto = sigExprObjeto(infoArray, 0, 0);
        if (exprObjeto.type === "PExito" && exprObjeto.expr.type === "EObjeto") {
            return exprObjeto.expr;
        } else {
            throw new ErrorComun(`Se esperaba un objeto al que importar.`);
        }
    };

    return (infoImport: InfoToken<string>) => {
        try {

            const rutaModulo = Expect.TTexto(
                lexer.sigToken.bind(lexer),
                undefined,
                "Se esperaba un string como ruta del módulo."
            );

            Expect.PC_IMPORT(
                lexer.sigToken(),
                "Se esperaba la palabra clave 'import' luego de la ruta del módulo.",
                lexer
            );

            // Intentar obtener identificador para el import default
            const sigToken = lexer.lookAhead();
            let tokenDefault: InfoToken<string> | undefined
            if (sigToken.type === "TokenLexer" && sigToken.token.type === "TIdentificador") {
                tokenDefault = sigToken.token.token
                lexer.sigToken();
            }

            // Verificar sig token
            const sigToken$ = lexer.lookAhead();
            let exprObjeto: EObjeto | undefined
            if (sigToken$.type === "ErrorLexer" || sigToken$.type === "EOFLexer") {
                return new PError(`Se esperaba un identificador u objeto luego de la palabra clave 'from'.`);
            }
            switch (sigToken$.token.type) {
                case "TComa": {
                    // Si no hay import default, una coma es un error sintactico
                    if (tokenDefault === undefined) {
                        const s = generarTextoError(lexer.entrada, sigToken$.token.token);
                        return new PError(`No se esperaba una coma aquí.\n${s}`);
                    } else {
                        // Consumir token coma
                        lexer.sigToken();
                        // Extraer token llaveAbierta
                        const sigToken$$ = lexer.sigToken();
                        if (sigToken$$.type !== "TokenLexer" || sigToken$$.token.type !== "TLlaveAb") {
                            return new PError(`Se esperaba un objeto luego de la coma.`);
                        }
                        exprObjeto = esperarExprObjeto(sigToken$$.token.token);
                    }
                    break;
                }
                case "TLlaveAb": {
                    if (tokenDefault === undefined) {
                        // Consumir y esperar una expresion de objeto
                        lexer.sigToken();
                        exprObjeto = esperarExprObjeto(sigToken$.token.token);
                    }
                    // Si hay import default se necesita una coma. Error sintactico
                    else {
                        const s = generarTextoError(lexer.entrada, sigToken$.token.token);
                        return new PError(`Se esperaba una coma entre el import default y el objeto.\n${s}`);
                    }

                    break;
                }
                case "TNuevaLinea": {
                    // OK. Si se encuentra una nueva linea significa
                    break;
                }
                default: {
                    const s = generarTextoError(lexer.entrada, sigToken$.token.token as InfoToken<any>);
                    return new PError(`No se esperaba este token dentro del import.\n${s}`);
                }
            }

            return new PExito(new EImport(
                rutaModulo,
                tokenDefault,
                exprObjeto,
                infoImport.inicio,
                infoImport.numLinea,
                infoImport.posInicioLinea
            ));

        } catch (e) {
            if (e instanceof ErrorComun) {
                return new PError(e.message);
            } else {
                throw e;
            }
        }
    };
}