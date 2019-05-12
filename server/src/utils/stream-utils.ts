export async function pipe(input: NodeJS.ReadableStream, output: NodeJS.WritableStream, options?: { end?: boolean; }) {
    const pipeCompleted = new Promise((resolve, reject) => {
        input.on('error', reject);
        input.on('end', resolve);
        output.on('error', reject);
        output.on('end', resolve);
    });

    input.pipe(output, options);
    await pipeCompleted;
}
