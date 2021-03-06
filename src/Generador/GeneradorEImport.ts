import { Expresion } from "../AnalisisSintactico/Expresion";
import { SourceNode } from "source-map";
import { EImport, EImportAll, EImportSolo } from "../AnalisisSintactico/Expresion/EImport";

export const getGeneradorJS_EImport = (
    inner: (expr: Expresion, toplevel: boolean, nivel: number, IIFE?: boolean) => [SourceNode, number],
    nivel: number,
    nombreArchivo: string | null
) => (eImport: EImport): [SourceNode, number] => {

    const infoRuta = eImport.rutaModulo;
    const nodoRuta = new SourceNode(
        infoRuta.numLinea,
        infoRuta.inicio - infoRuta.posInicioLinea,
        nombreArchivo,
        infoRuta.valor
    );

    const imports: (SourceNode | string)[] = [];

    if (eImport.importDefault) {
        const infoDefault = eImport.importDefault;
        const nodoImportDefault = new SourceNode(
            infoDefault.numLinea,
            infoDefault.inicio - infoDefault.posInicioLinea,
            nombreArchivo,
            infoDefault.valor
        );
        imports.push(nodoImportDefault);
    }

    if (eImport.importObj) {
        const nodoImports = inner(eImport.importObj, false, nivel)[0];
        if (imports.length > 0) {
            imports.push(", ");
        }
        imports.push(nodoImports);
    }

    return [new SourceNode(
        eImport.numLineaPE,
        eImport.inicioPE - eImport.posInicioLineaPE,
        nombreArchivo,
        [
            "import ",
            ...imports,
            " from \"",
            nodoRuta,
            "\""
        ]
    ), 0];
}

export const getGeneradorJS_EImportAll = (
    inner: (expr: Expresion, toplevel: boolean, nivel: number, IIFE?: boolean) => [SourceNode, number],
    nivel: number,
    nombreArchivo: string | null
) => (eImport: EImportAll): [SourceNode, number] => {

    const infoRuta = eImport.rutaModulo;
    const nodoRuta = new SourceNode(
        infoRuta.numLinea,
        infoRuta.inicio - infoRuta.posInicioLinea,
        nombreArchivo,
        infoRuta.valor
    );

    const idAs = eImport.importId.valor ;

    return [new SourceNode(
        eImport.numLineaPE,
        eImport.inicioPE - eImport.posInicioLineaPE,
        nombreArchivo,
        [
            "import * as ",
            idAs,
            " from \"",
            nodoRuta,
            "\""
        ]
    ), 0];
};

export const getGeneradorJS_EImportSolo = (
    nivel: number,
    nombreArchivo: string | null
) => (eImport: EImportSolo): [SourceNode, number] => {
    const infoRuta = eImport.rutaModulo;
    const nodoRuta = new SourceNode(
        infoRuta.numLinea,
        infoRuta.inicio - infoRuta.posInicioLinea,
        nombreArchivo,
        infoRuta.valor
    );

    return [new SourceNode(
        eImport.numLineaPE,
        eImport.inicioPE - eImport.posInicioLineaPE,
        nombreArchivo,
        [
            "import \"",
            nodoRuta,
            "\""
        ]
    ), 0];
};
