// main.go
package main

import (
	"fmt"
	"syscall/js"
)

func main() {
	c := make(chan struct{}, 0)
	js.Global().Set("hello", js.FuncOf(hello))
	<-c
}

func hello(this js.Value, inputs []js.Value) interface{} {
	fmt.Println("Hello, WebAssembly!")
	return nil
}
