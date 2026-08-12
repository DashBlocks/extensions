// Name: Maps
// ID: Den4ik12Maps
// Description: Blocks for working with Map, which is more powerful than Object.
// By: Den4ik-12 <https://scratch.mit.edu/users/Den4ik-12/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error(
      'Maps:\nExtension "Maps" must run unsandboxed!\nPlease enable the unsandboxed mode when loading the extension.'
    );
  }

  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const Cast = Scratch.Cast;
  const NormalArray = Scratch.NormalArray;
  const NormalObject = Scratch.NormalObject;

  const EXT_ID = "Den4ik12Maps";
  const CDT_MAP_ID = `${EXT_ID}_map`;
  const EXT_ICON =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgdmVyc2lvbj0iMS4xIgogICB3aWR0aD0iMjA1IgogICBoZWlnaHQ9IjIwNSIKICAgdmlld0JveD0iMCwwLDIwNSwyMDUiCiAgIGlkPSJzdmc4IgogICBzb2RpcG9kaTpkb2NuYW1lPSJFeHRJY29uLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMS40ICg4NmE4YWQ3LCAyMDI0LTEwLTExKSIKICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzOCIgLz4KICA8c29kaXBvZGk6bmFtZWR2aWV3CiAgICAgaWQ9Im5hbWVkdmlldzgiCiAgICAgcGFnZWNvbG9yPSIjZmZmZmZmIgogICAgIGJvcmRlcmNvbG9yPSIjMDAwMDAwIgogICAgIGJvcmRlcm9wYWNpdHk9IjAuMjUiCiAgICAgaW5rc2NhcGU6c2hvd3BhZ2VzaGFkb3c9IjIiCiAgICAgaW5rc2NhcGU6cGFnZW9wYWNpdHk9IjAuMCIKICAgICBpbmtzY2FwZTpwYWdlY2hlY2tlcmJvYXJkPSIwIgogICAgIGlua3NjYXBlOmRlc2tjb2xvcj0iI2QxZDFkMSIKICAgICBpbmtzY2FwZTp6b29tPSIyLjYzMDY2MiIKICAgICBpbmtzY2FwZTpjeD0iODUuMTQ5NjY5IgogICAgIGlua3NjYXBlOmN5PSI5MC42NjE1ODkiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ic3ZnOCIgLz4KICA8cGF0aAogICAgIGQ9Ik0xNDAsMTgwYzAsLTU1LjIyODQ3IDQ0Ljc3MTUzLC0xMDAgMTAwLC0xMDBjNTUuMjI4NDcsMCAxMDAsNDQuNzcxNTMgMTAwLDEwMGMwLDU1LjIyODQ3IC00NC43NzE1MywxMDAgLTEwMCwxMDBjLTU1LjIyODQ3LDAgLTEwMCwtNDQuNzcxNTMgLTEwMCwtMTAweiIKICAgICBmaWxsPSIjZTc0YzNjIgogICAgIHN0cm9rZT0iI2IwM2EyZSIKICAgICBzdHJva2Utd2lkdGg9IjUiCiAgICAgaWQ9InBhdGgxIgogICAgIHN0eWxlPSJtaXgtYmxlbmQtbW9kZTpub3JtYWw7ZmlsbDojZTczY2EwO2ZpbGwtb3BhY2l0eToxO3N0cm9rZTojYjIyZTdiO3N0cm9rZS1vcGFjaXR5OjEiCiAgICAgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTEzNy41LC03Ny41KSIgLz4KICA8cGF0aAogICAgIGQ9Im0gMTQzLjMxMDU1LDMzLjU2MjUgdiAxNC43OTg4MjggaCAzLjExNTIzIGMgNy43ODk3NiwwIDEwLjEyNjk1LDQuNjc1NDc0IDEwLjEyNjk1LDEyLjQ2NDg0NCAwLDIuMzM2NjgzIC0wLjc3OTI5LDYuMjMxODQ0IC0wLjc3OTI5LDkuMzQ3NjU2IDAsMy4xMTUzNjkgLTAuNzc5Myw3LjAwOTg1NyAtMC43NzkzLDExLjY4MzU5NCAwLDEzLjI0MjA2NSA1LjQ1MzQzLDE3LjkxNTAzOSAxNC44MDA3OCwyMC4yNTE5NTggLTkuMzQ3MzUsMi4zMzY2NSAtMTQuODAwNzgsNy4wMTE4NCAtMTQuODAwNzgsMjAuMjUzOSAwLDQuNjczOTkgMC43NzkzLDguNTY3OCAwLjc3OTMsMTEuNjgzNTkgMCwzLjg5NDk4IDAuNzc5MjksNy4wMTExIDAuNzc5MjksMTAuMTI2OTYgMCw3Ljc4OTYzIC0yLjMzNzYsMTIuNDYyODkgLTEwLjEyNjk1LDEyLjQ2Mjg5IGggLTMuMTE1MjMgdiAxNC44MDA3OCBoIDYuMjMwNDcgYyAxNi4zNTgwNSwwIDI2LjQ4NDM3LC03LjAxMTA5IDI2LjQ4NDM3LC0yMy4zNjkxNCAwLC0zLjg5NDY1IC0wLjc3NzM0LC04LjU2ODgzIC0wLjc3NzM0LC0xMy4yNDIxOSAwLC00LjY3MzQ0IC0wLjc3OTMsLTguNTY4NDkgLTAuNzc5MywtMTMuMjQyMTkgMCwtNS40NTMgMS41NTgxOSwtMTEuNjgzNTkgMTMuMjQyMTksLTExLjY4MzU5IGwgLTAuNzc5MywtMTQuODAwNzgxIGMgLTExLjY4NDE0LDAgLTEzLjI0MjE5LC03LjAxMTc2OCAtMTMuMjQyMTksLTExLjY4NTU0NyAwLC0zLjg5NDY3MSAzLjdlLTQsLTguNTY2ODYxIDAuNzc5MywtMTMuMjQwMjM0IDAuNzc4OTIsLTQuNjczMzY1IDAuNzc3MzQsLTguNTY4NDM2IDAuNzc3MzQsLTEzLjI0MjE4NyAwLC0xNy4xMzcwNDQgLTEwLjEyNTc0LC0yMy4zNjkxNDEgLTI1LjcwNTA3LC0yMy4zNjkxNDEgeiBtIC04Ny44NTE1NjYsMS41NTg1OTQgYyAtMTUuNTc5MzYsMCAtMjYuNDg0Mzc1LDYuMjMxNzg0IC0yNi40ODQzNzUsMjMuMzY5MTQgMCwzLjg5NDY4NSAtMC4wMDE2LDguNTY4NDM1IDAuNzc3MzQ0LDEzLjI0MjE4OCAwLDQuNjczMzY1IDAuNzc5Mjk3LDguNTY2NTExIDAuNzc5Mjk3LDEzLjI0MDIzNCAwLDQuNjczNDM1IC0xLjU1ODE0LDExLjY4NTU0NyAtMTMuMjQyMTg4LDExLjY4NTU0NyB2IDEzLjI0MjE4NyBjIDExLjY4NDExOCwwIDEzLjI0MjE4OCw2LjIzMjg0IDEzLjI0MjE4OCwxMS42ODU1NSAwLDMuODk0NjUgLTMuNjdlLTQsOC41NjY0NSAtMC43NzkyOTcsMTMuMjQwMjMgMCw0LjY3MzM2IC0wLjc3NzM0NCw4LjU2ODQ3IC0wLjc3NzM0NCwxMy4yNDIxOSAwLDE2LjM1ODA1IDEwLjEyNjMyOCwyMy4zNjkxNCAyNi40ODQzNzUsMjMuMzY5MTQgaCA2LjIzMDQ2OSB2IC0xNC43OTg4MyBoIC0zLjExNTIzNCBjIC03LjAxMDg2OCwtMC43Nzg2NSAtMTAuMTI2OTUzLC00LjY3NTQ4IC0xMC4xMjY5NTMsLTEyLjQ2NDg0IDAsLTMuMTE1OTkgMy41NGUtNCwtNi4yMzIxOCAwLjc3OTI5NiwtMTAuMTI2OTYgMCwtMy4xMTU5OSAwLjc3OTI5NywtNy4wMDk4MSAwLjc3OTI5NywtMTEuNjgzNTkgMCwtMTMuMjQyMDYgLTUuNDUzNDA5LC0xNy45MTUwOSAtMTQuODAwNzgxLC0yMC4yNTE5NSA5LjM0NzM3MiwtMi4zMzY3MDkgMTQuODAwNzgxLC03LjAxMTg0NSAxNC44MDA3ODEsLTIwLjI1MzkwOCAwLC0zLjg5NDY2NSAtMC43NzkyOTcsLTcuNzg4Nzg0IC0wLjc3OTI5NywtMTEuNjgzNTk0IC0wLjc3ODk0MiwtMy4xMTU2ODcgLTAuNzc5Mjk2LC02LjIzMTg0NCAtMC43NzkyOTYsLTkuMzQ3NjU2IDAsLTcuNzg5NjE5IDIuMzM3NTg0LC0xMi40NjI4OTEgMTAuMTI2OTUzLC0xMi40NjI4OTEgaCAzLjExNTIzNCBWIDM1LjEyMTA5NCBaIG0gNTIuOTg0Mzc2LDM2LjI2NTYyNSBjIC0xLjc0OTE0LDguNWUtNSAtMy40OTg1NywwLjY2NTk4MiAtNC44MzM5OCwxLjk5NDE0IC0yLjY2OTQ2LDIuNjU2MzI1IC0yLjY2OTQ3LDYuOTYyMTQxIDAsOS42MTkxNDEgNC41MzE2Myw0LjUwOTk1MSAzLjU1OTk4LDMuNTQ5ODY1IDUuNTEzNjcsNS41IEggNzEuMjAzMTI1IGMgLTMuMzI0LDAgLTYsMi42NzYgLTYsNiAwLDMuMzI0IDIuNjc2LDYgNiw2IGggNDcuOTcyNjU1IGMgMC4yNzkyOCwwLjc2MTM2IDAuNDcwOTksMS41MzY4MyAwLjQ3MjY2LDIuMjYxNzIgMC4wMDIsMC41NzE1NSAtMC4xMTA3NiwxLjE2Mjc2IC0wLjI5Mjk3LDEuNzQ2MDkgLTAuMDUxMSwtMC4wMDEgLTAuMTAwOTEsLTAuMDA4IC0wLjE1MjM0LC0wLjAwOCBIIDcxLjIwMzEyNSBjIC0zLjMyNCwwIC02LDIuNjc2IC02LDYgMCwzLjMyNCAyLjY3Niw2IDYsNiBoIDM4LjEyNjk1NSBjIC0yLjA2ODQzLDIuMDU4OSAtMS43OTcxNiwxLjc4ODI4IC01LjUyNTM5LDUuNSAtMi42Njk1OSwyLjY1NDM5IC0yLjY2OTU5LDYuOTYyNjkgMCw5LjYxOTE0IDIuNjY4MzQsMi42NTgyNiA2Ljk5NzE0LDIuNjU4MjYgOS42Njc5NywwIDEwLjUzNzc2LC0xMC40ODgyIDI0LjMyNDIyLC0yNC4yMTI4OSAyNC4zMjQyMSwtMjQuMjEyODkgMi42Njg5LC0yLjY1NTc2IDIuNjY4OSwtNi45NjIxNCAwLC05LjYxOTE0MSAwLDAgLTE1Ljk3Njc1LC0xNS45MDMwNzQgLTI0LjUyMTQ4LC0yNC40MDYyNSAtMS4zMzQ0NSwtMS4zMjg1MDEgLTMuMDgyODgsLTEuOTk0MjI2IC00LjgzMjAzLC0xLjk5NDE0IHoiCiAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtzdHJva2Utd2lkdGg6MC45OTk5OTc7LW1zLXRyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKTstd2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKSIKICAgICBpZD0icGF0aDExIiAvPgo8L3N2Zz4KPCEtLXJvdGF0aW9uQ2VudGVyOjEwMi41OjEwMi41LS0+Cgo=";
  const BLOCK_ICON =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgdmVyc2lvbj0iMS4xIgogICB3aWR0aD0iMTE3LjMzMzMzIgogICBoZWlnaHQ9IjExNy4zMzMzMyIKICAgdmlld0JveD0iMCwwLDExNy4zMzMzMywxMTcuMzMzMzMiCiAgIGlkPSJzdmcxNCIKICAgc29kaXBvZGk6ZG9jbmFtZT0iQmxvY2tJY29uLnN2ZyIKICAgaW5rc2NhcGU6dmVyc2lvbj0iMS40ICg4NmE4YWQ3LCAyMDI0LTEwLTExKSIKICAgeG1sbnM6aW5rc2NhcGU9Imh0dHA6Ly93d3cuaW5rc2NhcGUub3JnL25hbWVzcGFjZXMvaW5rc2NhcGUiCiAgIHhtbG5zOnNvZGlwb2RpPSJodHRwOi8vc29kaXBvZGkuc291cmNlZm9yZ2UubmV0L0RURC9zb2RpcG9kaS0wLmR0ZCIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMTQiIC8+CiAgPHNvZGlwb2RpOm5hbWVkdmlldwogICAgIGlkPSJuYW1lZHZpZXcxNCIKICAgICBwYWdlY29sb3I9IiNmZmZmZmYiCiAgICAgYm9yZGVyY29sb3I9IiMwMDAwMDAiCiAgICAgYm9yZGVyb3BhY2l0eT0iMC4yNSIKICAgICBpbmtzY2FwZTpzaG93cGFnZXNoYWRvdz0iMiIKICAgICBpbmtzY2FwZTpwYWdlb3BhY2l0eT0iMC4wIgogICAgIGlua3NjYXBlOnBhZ2VjaGVja2VyYm9hcmQ9IjAiCiAgICAgaW5rc2NhcGU6ZGVza2NvbG9yPSIjZDFkMWQxIgogICAgIGlua3NjYXBlOnpvb209IjQuNTk2MTg1MyIKICAgICBpbmtzY2FwZTpjeD0iNTUuMjYzMjIxIgogICAgIGlua3NjYXBlOmN5PSI2OS41MTQxNjkiCiAgICAgaW5rc2NhcGU6Y3VycmVudC1sYXllcj0ic3ZnMTQiIC8+CiAgPHBhdGgKICAgICBkPSJtIDgzLjU0OTEzNSwxNi42MzUwMDQgdiA5LjAyMjk0NiBoIDEuODk5Mzc2IGMgNC43NDk0NywwIDYuMTc0NDcxLDIuODUwNjY4IDYuMTc0NDcxLDcuNTk5ODk5IDAsMS40MjQ2OTIgLTAuNDc1MTM4LDMuNzk5NTk3IC0wLjQ3NTEzOCw1LjY5OTMyOSAwLDEuODk5NDYyIC0wLjQ3NTE0Niw0LjI3Mzk1OCAtMC40NzUxNDYsNy4xMjM1NjggMCw4LjA3Mzc3NiAzLjMyNDk5NCwxMC45MjI5MiA5LjAyNDEzMiwxMi4zNDc3NTUgLTUuNjk5MTM4LDEuNDI0NjcxIC05LjAyNDEzMiw0LjI3NTE2NiAtOS4wMjQxMzIsMTIuMzQ4OTQgMCwyLjg0OTc2MyAwLjQ3NTE0Niw1LjIyMzg0NSAwLjQ3NTE0Niw3LjEyMzU2NSAwLDIuMzc0Nzk1IDAuNDc1MTM4LDQuMjc0NzEzIDAuNDc1MTM4LDYuMTc0NDc2IDAsNC43NDkzOSAtMS40MjUyNTEsNy41OTg3MTEgLTYuMTc0NDcxLDcuNTk4NzExIGggLTEuODk5Mzc2IHYgOS4wMjQxMjcgaCAzLjc5ODc1OSBjIDkuOTczNjExLDAgMTYuMTQ3Njk2LC00LjI3NDcwOSAxNi4xNDc2OTYsLTE0LjI0ODMyIDAsLTIuMzc0NTg5IC0wLjQ3Mzk1LC01LjIyNDQ3IC0wLjQ3Mzk1LC04LjA3Mzg1IDAsLTIuODQ5NDI5IC0wLjQ3NTE0LC01LjIyNDI2NyAtMC40NzUxNCwtOC4wNzM4NTQgMCwtMy4zMjQ3MzEgMC45NTAwNCwtNy4xMjM1NjQgOC4wNzM4NSwtNy4xMjM1NjQgbCAtMC40NzUxNSwtOS4wMjQxMzYgYyAtNy4xMjM4OSwwIC04LjA3Mzg1LC00LjI3NTEyMyAtOC4wNzM4NSwtNy4xMjQ3NTcgMCwtMi4zNzQ2MDggMi4zZS00LC01LjIyMzI3MyAwLjQ3NTE1LC04LjA3MjY2MSAwLjQ3NDkyLC0yLjg0OTM4MiAwLjQ3Mzk1LC01LjIyNDIzMyAwLjQ3Mzk1LC04LjA3Mzg1MSAwLC0xMC40NDg1NzEgLTYuMTczNzM0LC0xNC4yNDgzMjMgLTE1LjY3MjU1NiwtMTQuMjQ4MzIzIHogTSAyOS45ODU0MzksMTcuNTg1MjkgYyAtOS40OTg4NDEsMCAtMTYuMTQ3NzAzLDMuNzk5NTYgLTE2LjE0NzcwMywxNC4yNDgzMjMgMCwyLjM3NDYxNSAtOS44ZS00LDUuMjI0MjMyIDAuNDczOTUzLDguMDczODUxIDAsMi44NDkzODIgMC40NzUxNDIsNS4yMjMwNiAwLjQ3NTE0Miw4LjA3MjY2IDAsMi44NDk0MjQgLTAuOTUwMDA5LDcuMTI0NzU3IC04LjA3Mzg1MTUsNy4xMjQ3NTcgdiA4LjA3Mzg1MSBjIDcuMTIzODg2NSwwIDguMDczODUxNSwzLjgwMDIwNSA4LjA3Mzg1MTUsNy4xMjQ3NiAwLDIuMzc0NTk0IC0yLjI0ZS00LDUuMjIzMDI0IC0wLjQ3NTE0Miw4LjA3MjY1OCAwLDIuODQ5MzggLTAuNDczOTUzLDUuMjI0MjUxIC0wLjQ3Mzk1Myw4LjA3Mzg1IDAsOS45NzM2MTEgNi4xNzQwOTEsMTQuMjQ4MzIgMTYuMTQ3NzAzLDE0LjI0ODMyIGggMy43OTg3NiBWIDkxLjY3NTM3OSBIIDMxLjg4NDgyIGMgLTQuMjc0NTc0LC0wLjQ3NDc0NSAtNi4xNzQ0NzIsLTIuODUwNjc2IC02LjE3NDQ3MiwtNy41OTk4OTcgMCwtMS44OTk4NDEgMi4xNWUtNCwtMy43OTk4MDIgMC40NzUxNDEsLTYuMTc0NDc2IDAsLTEuODk5ODQgMC40NzUxNDMsLTQuMjczOTI5IDAuNDc1MTQzLC03LjEyMzU2NSAwLC04LjA3Mzc3NCAtMy4zMjQ5OCwtMTAuOTIyOTUxIC05LjAyNDEzNiwtMTIuMzQ3NzUgNS42OTkxNTYsLTEuNDI0NzA5IDkuMDI0MTM2LC00LjI3NTE3MSA5LjAyNDEzNiwtMTIuMzQ4OTQ1IDAsLTIuMzc0NjA1IC0wLjQ3NTE0MywtNC43NDg4NzUgLTAuNDc1MTQzLC03LjEyMzU2OCAtMC40NzQ5MjYsLTEuODk5NjU2IC0wLjQ3NTE0MSwtMy43OTk1OTggLTAuNDc1MTQxLC01LjY5OTMyOSAwLC00Ljc0OTM4MyAxLjQyNTI0LC03LjU5ODcwOSA2LjE3NDQ3MiwtNy41OTg3MDkgaCAxLjg5OTM3OSB2IC04LjA3Mzg1IHogbSAzMi4zMDQ5MzMsMjIuMTExMzk3IGMgLTEuMDY2NDYzLDUuMWUtNSAtMi4xMzMxMDIsMC40MDYwNTIgLTIuOTQ3MzEsMS4yMTU4NCAtMS42Mjc1ODcsMS42MTk1NzkgLTEuNjI3NTk1LDQuMjQ0ODY1IDAsNS44NjQ4NTYgMi43NjI5NjUsMi43NDk3NDcgMi4xNzA1NDQsMi4xNjQzNzYgMy4zNjE3MjIsMy4zNTMzODYgSCAzOS41ODQ3NDkgYyAtMi4wMjY2NjYsMCAtMy42NTgyNCwxLjYzMTU3NyAtMy42NTgyNCwzLjY1ODI0MSAwLDIuMDI2NjY1IDEuNjMxNTc0LDMuNjU4MjQxIDMuNjU4MjQsMy42NTgyNDEgaCAyOS4yNDkyNTIgYyAwLjE3MDI3OSwwLjQ2NDIwNiAwLjI4NzE2NiwwLjkzNzAxNSAwLjI4ODE4NCwxLjM3ODk4NyAwLjAwMTIsMC4zNDg0NzcgLTAuMDY3NTMsMC43MDg5NDEgLTAuMTc4NjI0LDEuMDY0NjAyIC0wLjAzMTE2LC02LjFlLTQgLTAuMDYxNTMsLTAuMDA0OSAtMC4wOTI4OCwtMC4wMDQ5IEggMzkuNTg0NzQ5IGMgLTIuMDI2NjY2LDAgLTMuNjU4MjQsMS42MzE1NzYgLTMuNjU4MjQsMy42NTgyNDIgMCwyLjAyNjY2NCAxLjYzMTU3NCwzLjY1ODI0IDMuNjU4MjQsMy42NTgyNCBoIDIzLjI0NjI2MyBjIC0xLjI2MTEzNiwxLjI1NTMyNSAtMS4wOTU3NDIsMS4wOTAzMjYgLTMuMzY4ODY4LDMuMzUzMzg2IC0xLjYyNzY2OCwxLjYxODQgLTEuNjI3NjY4LDQuMjQ1MjAxIDAsNS44NjQ4NTkgMS42MjY5MDUsMS42MjA3NTggNC4yNjYyMDMsMS42MjA3NTggNS44OTQ2MjcsMCBDIDcxLjc4MTcxNCw3MC4wMjU5MzggODAuMTg3NDEyLDYxLjY1NzkgODAuMTg3NDA2LDYxLjY1NzkgYyAxLjYyNzI0NywtMS42MTkyMzUgMS42MjcyNDcsLTQuMjQ0ODY0IDAsLTUuODY0ODU0IDAsMCAtOS43NDExMzIsLTkuNjk2MjEzIC0xNC45NTA5MTMsLTE0Ljg4MDY1NiAtMC44MTM2MjIsLTAuODA5OTk2IC0xLjg3OTY1MiwtMS4yMTU4OTQgLTIuOTQ2MTIxLC0xLjIxNTg0MSB6IgogICAgIHN0eWxlPSJmaWxsOm5vbmU7c3Ryb2tlLXdpZHRoOjEwOy1tcy10cmFuc2Zvcm06cm90YXRlKDM2MGRlZyk7LXdlYmtpdC10cmFuc2Zvcm06cm90YXRlKDM2MGRlZyk7ZmlsbC1vcGFjaXR5OjAuMTQ5MDE5NjE7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZTojMDAwMDAwO3N0cm9rZS1vcGFjaXR5OjAuMTQ5MDE5NjEiCiAgICAgaWQ9InBhdGgxNCIgLz4KICA8cGF0aAogICAgIGQ9Im0gODMuNTQ5MTM1LDE2LjYzNTAwNCB2IDkuMDIyOTQ2IGggMS44OTkzNzYgYyA0Ljc0OTQ3LDAgNi4xNzQ0NzEsMi44NTA2NjggNi4xNzQ0NzEsNy41OTk4OTkgMCwxLjQyNDY5MiAtMC40NzUxMzgsMy43OTk1OTcgLTAuNDc1MTM4LDUuNjk5MzI5IDAsMS44OTk0NjIgLTAuNDc1MTQ2LDQuMjczOTU4IC0wLjQ3NTE0Niw3LjEyMzU2OCAwLDguMDczNzc2IDMuMzI0OTk0LDEwLjkyMjkyIDkuMDI0MTMyLDEyLjM0Nzc1NSAtNS42OTkxMzgsMS40MjQ2NzEgLTkuMDI0MTMyLDQuMjc1MTY2IC05LjAyNDEzMiwxMi4zNDg5NCAwLDIuODQ5NzYzIDAuNDc1MTQ2LDUuMjIzODQ1IDAuNDc1MTQ2LDcuMTIzNTY1IDAsMi4zNzQ3OTUgMC40NzUxMzgsNC4yNzQ3MTMgMC40NzUxMzgsNi4xNzQ0NzYgMCw0Ljc0OTM5IC0xLjQyNTI1MSw3LjU5ODcxMSAtNi4xNzQ0NzEsNy41OTg3MTEgaCAtMS44OTkzNzYgdiA5LjAyNDEyNyBoIDMuNzk4NzU5IGMgOS45NzM2MTEsMCAxNi4xNDc2OTYsLTQuMjc0NzA5IDE2LjE0NzY5NiwtMTQuMjQ4MzIgMCwtMi4zNzQ1ODkgLTAuNDczOTUsLTUuMjI0NDcgLTAuNDczOTUsLTguMDczODUgMCwtMi44NDk0MjkgLTAuNDc1MTQsLTUuMjI0MjY3IC0wLjQ3NTE0LC04LjA3Mzg1NCAwLC0zLjMyNDczMSAwLjk1MDA0LC03LjEyMzU2NCA4LjA3Mzg1LC03LjEyMzU2NCBsIC0wLjQ3NTE1LC05LjAyNDEzNiBjIC03LjEyMzg5LDAgLTguMDczODUsLTQuMjc1MTIzIC04LjA3Mzg1LC03LjEyNDc1NyAwLC0yLjM3NDYwOCAyLjNlLTQsLTUuMjIzMjczIDAuNDc1MTUsLTguMDcyNjYxIDAuNDc0OTIsLTIuODQ5MzgyIDAuNDczOTUsLTUuMjI0MjMzIDAuNDczOTUsLTguMDczODUxIDAsLTEwLjQ0ODU3MSAtNi4xNzM3MzQsLTE0LjI0ODMyMyAtMTUuNjcyNTU2LC0xNC4yNDgzMjMgeiBNIDI5Ljk4NTQzOSwxNy41ODUyOSBjIC05LjQ5ODg0MSwwIC0xNi4xNDc3MDMsMy43OTk1NiAtMTYuMTQ3NzAzLDE0LjI0ODMyMyAwLDIuMzc0NjE1IC05LjhlLTQsNS4yMjQyMzIgMC40NzM5NTMsOC4wNzM4NTEgMCwyLjg0OTM4MiAwLjQ3NTE0Miw1LjIyMzA2IDAuNDc1MTQyLDguMDcyNjYgMCwyLjg0OTQyNCAtMC45NTAwMDksNy4xMjQ3NTcgLTguMDczODUxNSw3LjEyNDc1NyB2IDguMDczODUxIGMgNy4xMjM4ODY1LDAgOC4wNzM4NTE1LDMuODAwMjA1IDguMDczODUxNSw3LjEyNDc2IDAsMi4zNzQ1OTQgLTIuMjRlLTQsNS4yMjMwMjQgLTAuNDc1MTQyLDguMDcyNjU4IDAsMi44NDkzOCAtMC40NzM5NTMsNS4yMjQyNTEgLTAuNDczOTUzLDguMDczODUgMCw5Ljk3MzYxMSA2LjE3NDA5MSwxNC4yNDgzMiAxNi4xNDc3MDMsMTQuMjQ4MzIgaCAzLjc5ODc2IFYgOTEuNjc1Mzc5IEggMzEuODg0ODIgYyAtNC4yNzQ1NzQsLTAuNDc0NzQ1IC02LjE3NDQ3MiwtMi44NTA2NzYgLTYuMTc0NDcyLC03LjU5OTg5NyAwLC0xLjg5OTg0MSAyLjE1ZS00LC0zLjc5OTgwMiAwLjQ3NTE0MSwtNi4xNzQ0NzYgMCwtMS44OTk4NCAwLjQ3NTE0MywtNC4yNzM5MjkgMC40NzUxNDMsLTcuMTIzNTY1IDAsLTguMDczNzc0IC0zLjMyNDk4LC0xMC45MjI5NTEgLTkuMDI0MTM2LC0xMi4zNDc3NSA1LjY5OTE1NiwtMS40MjQ3MDkgOS4wMjQxMzYsLTQuMjc1MTcxIDkuMDI0MTM2LC0xMi4zNDg5NDUgMCwtMi4zNzQ2MDUgLTAuNDc1MTQzLC00Ljc0ODg3NSAtMC40NzUxNDMsLTcuMTIzNTY4IC0wLjQ3NDkyNiwtMS44OTk2NTYgLTAuNDc1MTQxLC0zLjc5OTU5OCAtMC40NzUxNDEsLTUuNjk5MzI5IDAsLTQuNzQ5MzgzIDEuNDI1MjQsLTcuNTk4NzA5IDYuMTc0NDcyLC03LjU5ODcwOSBoIDEuODk5Mzc5IHYgLTguMDczODUgeiBtIDMyLjMwNDkzMywyMi4xMTEzOTcgYyAtMS4wNjY0NjMsNS4xZS01IC0yLjEzMzEwMiwwLjQwNjA1MiAtMi45NDczMSwxLjIxNTg0IC0xLjYyNzU4NywxLjYxOTU3OSAtMS42Mjc1OTUsNC4yNDQ4NjUgMCw1Ljg2NDg1NiAyLjc2Mjk2NSwyLjc0OTc0NyAyLjE3MDU0NCwyLjE2NDM3NiAzLjM2MTcyMiwzLjM1MzM4NiBIIDM5LjU4NDc0OSBjIC0yLjAyNjY2NiwwIC0zLjY1ODI0LDEuNjMxNTc3IC0zLjY1ODI0LDMuNjU4MjQxIDAsMi4wMjY2NjUgMS42MzE1NzQsMy42NTgyNDEgMy42NTgyNCwzLjY1ODI0MSBoIDI5LjI0OTI1MiBjIDAuMTcwMjc5LDAuNDY0MjA2IDAuMjg3MTY2LDAuOTM3MDE1IDAuMjg4MTg0LDEuMzc4OTg3IDAuMDAxMiwwLjM0ODQ3NyAtMC4wNjc1MywwLjcwODk0MSAtMC4xNzg2MjQsMS4wNjQ2MDIgLTAuMDMxMTYsLTYuMWUtNCAtMC4wNjE1MywtMC4wMDQ5IC0wLjA5Mjg4LC0wLjAwNDkgSCAzOS41ODQ3NDkgYyAtMi4wMjY2NjYsMCAtMy42NTgyNCwxLjYzMTU3NiAtMy42NTgyNCwzLjY1ODI0MiAwLDIuMDI2NjY0IDEuNjMxNTc0LDMuNjU4MjQgMy42NTgyNCwzLjY1ODI0IGggMjMuMjQ2MjYzIGMgLTEuMjYxMTM2LDEuMjU1MzI1IC0xLjA5NTc0MiwxLjA5MDMyNiAtMy4zNjg4NjgsMy4zNTMzODYgLTEuNjI3NjY4LDEuNjE4NCAtMS42Mjc2NjgsNC4yNDUyMDEgMCw1Ljg2NDg1OSAxLjYyNjkwNSwxLjYyMDc1OCA0LjI2NjIwMywxLjYyMDc1OCA1Ljg5NDYyNywwIEMgNzEuNzgxNzE0LDcwLjAyNTkzOCA4MC4xODc0MTIsNjEuNjU3OSA4MC4xODc0MDYsNjEuNjU3OSBjIDEuNjI3MjQ3LC0xLjYxOTIzNSAxLjYyNzI0NywtNC4yNDQ4NjQgMCwtNS44NjQ4NTQgMCwwIC05Ljc0MTEzMiwtOS42OTYyMTMgLTE0Ljk1MDkxMywtMTQuODgwNjU2IC0wLjgxMzYyMiwtMC44MDk5OTYgLTEuODc5NjUyLC0xLjIxNTg5NCAtMi45NDYxMjEsLTEuMjE1ODQxIHoiCiAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtzdHJva2Utd2lkdGg6MC45OTk5OTQ7LW1zLXRyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKTstd2Via2l0LXRyYW5zZm9ybTpyb3RhdGUoMzYwZGVnKSIKICAgICBpZD0icGF0aDExIiAvPgo8L3N2Zz4KPCEtLXJvdGF0aW9uQ2VudGVyOjU4LjY2NjY2NjY2NjY2NjY2OjU4LjY2NjY2NjY2NjY2NjY2LS0+Cgo=";
  const MAP_BLOCK_TYPE = {
    blockType: Scratch.BlockType.REPORTER,
    blockShape: Scratch.BlockShape.SCRAPPED,
    forceOutputType: CDT_MAP_ID,
  };
  const MAP_ARG_TYPE = {
    shape: Scratch.BlockShape.SCRAPPED,
    check: CDT_MAP_ID,
  };

  class CDTMap extends Map {
    customId = CDT_MAP_ID;

    constructor(...args) {
      super(...args);
    }

    _generateMapContent() {
      const content = document.createElement("span");

      if (this.size === 0) {
        content.textContent = "{}";
        return content;
      }

      const maxShownItems = 70;
      const more = this.size - maxShownItems;
      let currentSpan = document.createElement("span");
      content.appendChild(currentSpan);

      this.entries().toArray().slice(0, maxShownItems).forEach(function (item, i, array) {
        if (i === 0) {
          currentSpan.textContent += "{";
        }

        let value = item[0];
        if (Cast.isCustomType(value) || Cast.isNormalArray(value) || Cast.isNormalObject(value)) {
          if (typeof value.toReporterJSONItem === "function") {
            content.appendChild(value.toReporterJSONItem());
          } else {
            const add = document.createElement("i");
            add.textContent = "*custom type*";
            content.appendChild(add);
          }
          currentSpan = document.createElement("span");
          content.appendChild(currentSpan);
        } else {
          currentSpan.textContent += JSON.stringify(value);
        }

        currentSpan.textContent += " => ";

        value = item[1];
        if (Cast.isCustomType(value) || Cast.isNormalArray(value) || Cast.isNormalObject(value)) {
          if (typeof value.toReporterJSONItem === "function") {
            content.appendChild(value.toReporterJSONItem());
          } else {
            const add = document.createElement("i");
            add.textContent = "*custom type*";
            content.appendChild(add);
          }
          currentSpan = document.createElement("span");
          content.appendChild(currentSpan);
        } else {
          currentSpan.textContent += JSON.stringify(value);
        }

        if (i === array.length - 1) {
          if (more > 0) {
            currentSpan.textContent += ", ";
            var add = document.createElement("i");
            add.textContent = `*${more} more items*`;
            content.appendChild(add);
            currentSpan = document.createElement("span");
            content.appendChild(currentSpan);
          }
          currentSpan.textContent += "}";
        } else {
          currentSpan.textContent += ", ";
        }
      });
      return content;
    }

    toMonitorContent() {
      return this._generateMapContent();
    }

    toReporterContent() {
      return this._generateMapContent();
    }

    toReporterJSONItem() {
      let el = document.createElement("i");
      el.textContent = `Map(${this.size})`;
      return el;
    }

    toListItem() {
      let el = document.createElement("i");
      el.textContent = `Map(${this.size})`;
      return el;
    }

    toListEditor() {
      return `Map(${this.size})`;
    }
  }

  class Maps {
    constructor() {
      runtime.registerSerializer(
        CDT_MAP_ID,
        function*(obj) {
          const result = [];
          for (let [key, item] of obj) {
            result.push([yield key, yield item]);
          }
          return result;
        },
        function*(serialized) {
          const result = new CDTMap();
          for (let [key, item] of serialized) {
            result.set(yield key, yield item);
          }
          return result;
        }
      );
    }
    getInfo() {
      return {
        id: EXT_ID,
        name: Scratch.translate("Maps"),
        color1: "#e73ca0",
        color2: "#cb348c",
        color3: "#b22e7b",
        menuIconURI: EXT_ICON,
        blockIconURI: BLOCK_ICON,
        blocks: [
          {
            opcode: "empty",
            ...MAP_BLOCK_TYPE,
            text: Scratch.translate("empty map"),
            disableMonitor: true,
          },
          {
            opcode: "split",
            ...MAP_BLOCK_TYPE,
            text: Scratch.translate(
              "map from [TEXT] with key [KEYDELIM] and pair [PAIRDELIM] delimeters"
            ),
            arguments: {
              TEXT: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "key1=>apple,key2=>banana",
              },
              KEYDELIM: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "=>",
              },
              PAIRDELIM: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: ",",
              },
            },
          },
          "---",
          {
            opcode: "asMap",
            ...MAP_BLOCK_TYPE,
            text: Scratch.translate("[VALUE] as map"),
            arguments: {
              VALUE: {
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "isMap",
            text: Scratch.translate("[VALUE] is map?"),
            blockType: Scratch.BlockType.BOOLEAN,
            arguments: {
              VALUE: {
                type: Scratch.ArgumentType.STRING,
              },
            },
          },
          {
            opcode: "mapAsObject",
            blockType: Scratch.BlockType.OBJECT,
            text: Scratch.translate("map [MAP] as object"),
            arguments: {
              MAP: MAP_ARG_TYPE,
            },
          },
          "---",
          {
            opcode: "size",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("size of map [MAP]"),
            arguments: {
              MAP: MAP_ARG_TYPE,
            },
          },
          {
            opcode: "itemOf",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("item of key [KEY] in map [MAP]"),
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "key",
              },
              MAP: MAP_ARG_TYPE,
            },
          },
          {
            opcode: "containsKey",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("map [MAP] contains key [KEY]"),
            arguments: {
              MAP: MAP_ARG_TYPE,
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "key",
              },
            },
          },
          {
            opcode: "containsItem",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("map [MAP] contains [ITEM]"),
            arguments: {
              MAP: MAP_ARG_TYPE,
              ITEM: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "item",
              },
            },
          },
          {
            opcode: "entries",
            text: Scratch.translate("[ENUMERATION_TYPE] of map [MAP]"),
            blockType: Scratch.BlockType.ARRAY,
            arguments: {
              ENUMERATION_TYPE: {
                menu: "ENUMERATION_TYPE",
                defaultValue: "entries",
              },
              MAP: MAP_ARG_TYPE,
            },
          },
          "---",
          {
            opcode: "set",
            ...MAP_BLOCK_TYPE,
            text: Scratch.translate("set key [KEY] to [ITEM] in map [MAP]"),
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "key",
              },
              ITEM: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "item",
              },
              MAP: MAP_ARG_TYPE,
            },
          },
          {
            opcode: "delete",
            ...MAP_BLOCK_TYPE,
            text: Scratch.translate("delete key [KEY] in map [MAP]"),
            arguments: {
              KEY: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "key",
              },
              MAP: MAP_ARG_TYPE,
            },
          },
        ],
        menus: {
          ENUMERATION_TYPE: {
            items: [
              {
                text: Scratch.translate("entries"),
                value: "entries",
              },
              {
                text: Scratch.translate("keys"),
                value: "keys",
              },
              {
                text: Scratch.translate("values"),
                value: "values",
              },
            ],
          },
        },
      };
    }
    _toMap(value) {
      if (value instanceof CDTMap) return value;
      if (Cast.isNormalArray(value)) {
        try {
          return new CDTMap(value);
        } catch {
          return new CDTMap();
        }
      }
      if (Cast.isNormalObject(value)) {
        return new CDTMap(value);
      }
      try {
        const result = JSON.parse(value, (key, value) => {
          if (Array.isArray(value)) return new NormalArray(value);
          if (typeof value === 'object' && value instanceof Object) return new NormalObject(Object.entries(value));
          return value;
        });
        return Array.isArray(result)
          ? new CDTMap(result)
          : Cast.isNormalObject(result)
          ? new CDTMap(result)
          : new CDTMap();
      } catch {
        return new CDTMap();
      }
    }
    empty() {
      return new CDTMap();
    }
    split(args) {
      const text = Cast.toString(args.TEXT);
      const keyDelimiter = Cast.toString(args.KEYDELIM);
      const pairDelimiter = Cast.toString(args.PAIRDELIM);
      let error = false;
      const result = text.split(pairDelimiter).reduce((acc, pair) => {
        if (!error) {
          const splitted = pair.split(keyDelimiter);
          if (splitted.length === 2) {
            return acc.set(...splitted);
          }
          error = true;
        }
      }, new CDTMap());
      return error ? new CDTMap() : result;
    }
    asMap(args) {
      return this._toMap(args.VALUE);
    }
    isMap(args) {
      return args.VALUE instanceof CDTMap;
    }
    mapAsObject(args) {
      const obj = new NormalObject();
      for (const [key, value] of this._toMap(args.MAP).entries()) {
        obj.set(key, value);
      }
      return obj;
    }
    size(args) {
      return this._toMap(args.MAP).size;
    }
    itemOf(args) {
      const map = this._toMap(args.MAP);
      return map.has(args.KEY) ? map.get(args.KEY) : "";
    }
    containsKey(args) {
      return this._toMap(args.MAP).has(args.KEY);
    }
    containsItem(args) {
      return this._toMap(args.MAP).values().toArray().includes(args.ITEM);
    }
    entries(args) {
      const map = this._toMap(args.MAP);
      switch (args.ENUMERATION_TYPE) {
        case "entries":
          return new NormalArray(map.entries().toArray());
        case "keys":
          return new NormalArray(map.keys().toArray());
        case "values":
          return new NormalArray(map.values().toArray());
        default: 
          return new NormalArray();
      }
    }
    set(args) {
      return this._toMap(args.MAP).set(args.KEY, args.ITEM);
    }
    delete(args) {
      return this._toMap(args.MAP).delete(args.KEY);
    }
  }
  Scratch.extensions.register(new Maps());
})(Scratch);
