export class DocumentDirectionSettings {
    public fileDirections: { [path: string]: string } = {};
    public defaultDirection = 'ltr';
    public rememberPerFile = true;
    public setNoteTitleDirection = true;
    public setYamlDirection = false;

    toJson() {
        return JSON.stringify(this);
    }

    fromJson(content: string) {
        const obj = JSON.parse(content);
        this.fileDirections = obj['fileDirections'];
        this.defaultDirection = obj['defaultDirection'];
        this.rememberPerFile = obj['rememberPerFile'];
        this.setNoteTitleDirection = obj['setNoteTitleDirection'];
    }
}
