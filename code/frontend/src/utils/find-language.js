export const findLanguageByCodeBlockName = (languages, inputLanguageName) => {
  console.log("+", inputLanguageName)
  if (!inputLanguageName) {
    return null
  }

  return languages.find(
    (language) =>
      language.name === inputLanguageName ||
      (language.alias && language.alias.includes(inputLanguageName))
  ) ?? null
}
