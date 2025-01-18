import { parseCodeBlockParameters } from './code-block-parameters'

export const findLanguageByCodeBlockName = (languages, inputLanguageName) => {
  const { language: filteredLanguage } = parseCodeBlockParameters(inputLanguageName)
  if (!filteredLanguage) {
    return null
  }

  return languages.find(
    (language) =>
      language.name === filteredLanguage ||
      (language.alias && language.alias.includes(filteredLanguage))
  ) ?? null
}
