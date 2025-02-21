package version

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestVersionCmd(t *testing.T) {
	assert.Equal(t, "version", VersionCmd.Use)
	assert.Equal(t, "Manage note versions, requires noted to be unlocked", VersionCmd.Short)
	assert.Contains(t, VersionCmd.Long, "Manage note versions")

	subCmds := VersionCmd.Commands()
	var cmdNames []string
	for _, cmd := range subCmds {
		cmdNames = append(cmdNames, cmd.Name())
	}

	assert.Contains(t, cmdNames, "list")
	assert.Contains(t, cmdNames, "show")
	assert.Contains(t, cmdNames, "restore")
	assert.Contains(t, cmdNames, "diff")
	assert.Equal(t, 4, len(cmdNames))
}

func TestInit(t *testing.T) {
	var foundCmds int
	for _, cmd := range VersionCmd.Commands() {
		switch cmd.Name() {
		case "list", "show", "restore", "diff":
			foundCmds++
		}
	}
	assert.Equal(t, 4, foundCmds)
}
