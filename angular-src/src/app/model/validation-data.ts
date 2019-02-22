export class ValidationData {
    success: boolean;
    uploadErrorType: string;
    skus: {
        createlist: [];
        ignorelist: [];
        errorlist: [];
        changelist: [];
    };
    ingredients: {
        createlist: [];
        ignorelist: [];
        errorlist: [];
        changelist: [];
    };
    product_lines: {
        createlist: [];
        ignorelist: [];
        errorlist: [];
    };
    formulas: {
        createlist: [];
        errorlist: [];
        ignorelist: [];
    };
}