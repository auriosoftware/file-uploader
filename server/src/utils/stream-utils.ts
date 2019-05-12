export async function pipe(input: NodeJS.ReadableStream, output: NodeJS.WritableStream) {
    const pipeCompleted = new Promise((resolve, reject) => {
        input.on('error', reject);
        input.on('end', resolve);
        output.on('error', reject);
        output.on('end', resolve);
    });

    input.pipe(output);
    await pipeCompleted;
}
