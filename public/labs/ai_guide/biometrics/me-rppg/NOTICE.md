# ME-rPPG weights

`model.onnx` is copied unchanged from
[Health-HCI-Group/ME-rPPG-demo](https://github.com/Health-HCI-Group/ME-rPPG-demo)
at commit `66c139d9d215c08b12d7ed2cea4307d71b679220`, licensed Apache-2.0 (see `LICENSE`).

Change: the demo's initial hidden state (`state.json`, 7 MB of nested JSON
arrays) is repacked as `state.bin` (the same float32 values, little-endian,
concatenated) with `state.json` listing each tensor's shape, offset and length.

Before shipping beyond the labs, confirm which datasets these weights were
trained on; rPPG datasets are commonly licensed for research only.
