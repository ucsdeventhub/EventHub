package utils_test

import (
	"testing"

	"github.com/ucsdeventhub/EventHub/utils"
)

func TestSecretCode(t *testing.T) {

	for l := 0; l < 20; l++ {
		for i := 0; i < 1000; i++ {
			code, err := utils.SecretCode(l)
			if err != nil {
				t.Fatal(err)
			}

			if len(code) != l {
				t.Fatalf("code has incorrect length, got %v expected length %d", code, l)
			}
		}
	}
}
