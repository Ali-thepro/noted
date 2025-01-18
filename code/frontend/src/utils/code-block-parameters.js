const codeFenceArguments = /^ *([\w-]*)(.*)$/

export const parseCodeBlockParameters = (text) => {
  const parsedText = codeFenceArguments.exec(text)
  return {
    language: parsedText?.[1]?.trim() ?? '',
    codeFenceParameters: parsedText?.[2]?.trim() ?? ''
  }
}
