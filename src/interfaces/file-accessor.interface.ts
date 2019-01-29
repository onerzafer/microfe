export interface FileAccessor {
    readFile(path: string): Promise<string>;
    writeFile(path: string, fileUpdatedContent: string): Promise<void >;
    copyFile(source: string, destination: string): Promise<void >;
}
