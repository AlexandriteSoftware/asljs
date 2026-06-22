export interface MainOptions
{
  envelopePath?: string;
  patchPath?: string;
  patchVerifyCmd?: string;
}

export interface NewEnvelope
{
  instruction: string;
  files: unknown[];
}
