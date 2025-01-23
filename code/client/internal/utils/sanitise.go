package utils

import (
	"regexp"
	"strings"
	"unicode"
)

func SanitiseTitle(title string) string {
	title = strings.ToLower(title)

	var sanitisedBuilder strings.Builder

	for _, r := range title {
		if unicode.IsLetter(r) || unicode.IsDigit(r) {
			sanitisedBuilder.WriteRune(r)
		} else {
			sanitisedBuilder.WriteRune('-')
		}
	}

	sanitised := sanitisedBuilder.String()

	sanitised = removeDuplicatedHyphens(sanitised)
	sanitised = trimEnds(sanitised)

	return sanitised
}

func removeDuplicatedHyphens(input string) (output string) {
	reg, _ := regexp.Compile("-{2,}")
	output = reg.ReplaceAllString(input, "-")
	return output
}

func trimEnds(input string) (output string) {
	output = strings.TrimFunc(input, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	})
	return output
}
