import type { PipeMetadata, PipeToken } from '../constants';

function instantiatePipe(pipe: PipeToken) {
  if (typeof pipe === 'function') {
    return new pipe();
  }
  return pipe;
}

export async function runPipeChain(
  value: unknown,
  pipes: PipeToken[],
  metadata: PipeMetadata,
): Promise<unknown> {
  let current = value;
  for (const pipeToken of pipes) {
    const pipe = instantiatePipe(pipeToken);
    current = await pipe.transform(current, metadata);
  }
  return current;
}

