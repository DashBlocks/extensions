// Name: Targets
// ID: Den4ik12Targets
// Description: Easily manage your sprites, clones, and their properties.
// By: Den4ik-12 <https://scratch.mit.edu/users/Den4ik-12/>
// License: MPL-2.0

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error(
      'Extension "Targets" must run unsandboxed! Please enable the unsandboxed mode when loading the extension.'
    );
  }

  const vm = Scratch.vm;
  const runtime = vm.runtime;
  const Cast = Scratch.Cast;

  const EXT_ID = "Den4ik12Targets";
  const CDT_TARGET_LINK_ID = `${EXT_ID}_targetLink`;
  const EXT_ICON =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgdmVyc2lvbj0iMS4xIgogICB3aWR0aD0iMjA1IgogICBoZWlnaHQ9IjIwNSIKICAgdmlld0JveD0iMCAwIDIwNSAyMDUiCiAgIGlkPSJzdmc4IgogICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgIHhtbG5zOnN2Zz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogIDxkZWZzCiAgICAgaWQ9ImRlZnM4IiAvPgogIDxwYXRoCiAgICAgZD0ibSAyLjUsMTAyLjUgYyAwLC01NS4yMjg0NyA0NC43NzE1MywtMTAwIDEwMCwtMTAwIDU1LjIyODQ3LDAgMTAwLDQ0Ljc3MTUzIDEwMCwxMDAgMCw1NS4yMjg0NyAtNDQuNzcxNTMsMTAwIC0xMDAsMTAwIC01NS4yMjg0NywwIC0xMDAsLTQ0Ljc3MTUzIC0xMDAsLTEwMCB6IgogICAgIGZpbGw9IiNlNzRjM2MiCiAgICAgc3Ryb2tlPSIjYjAzYTJlIgogICAgIHN0cm9rZS13aWR0aD0iNSIKICAgICBpZD0icGF0aDEiCiAgICAgc3R5bGU9Im1peC1ibGVuZC1tb2RlOm5vcm1hbDtmaWxsOiM1MDU4Y2U7ZmlsbC1vcGFjaXR5OjE7ZmlsbC1ydWxlOm5vbnplcm87c3Ryb2tlOiMzZjQ2YTM7c3Ryb2tlLWxpbmVjYXA6YnV0dDtzdHJva2UtbGluZWpvaW46bWl0ZXI7c3Ryb2tlLW1pdGVybGltaXQ6MTA7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1kYXNob2Zmc2V0OjA7c3Ryb2tlLW9wYWNpdHk6MSIgLz4KICA8cGF0aAogICAgIGQ9Im0gOTcuNDMwOTY3LDIyLjc1NDc1IGMgLTQuNDE1MTM1LC0wLjM4NjI3NCAtOC4yODA1MjksMi44NTcxNzcgLTguNjY2ODAzLDcuMjcyMzEyIGwgLTAuNzk4MzYsOS4xMjUyOTggQyA2Ny42Mjc2MDUsNDMuODE5NzQ1IDUwLjc2Njc1OCw1Ny45Njc2NzYgNDIuNjM4NTksNzcuMTg2NDA5IGwgLTkuMTI1Mjk5LC0wLjc5ODM2MSBjIC00LjQxNTEzNSwtMC4zODYyNzQgLTguMjgwNTI5LDIuODU3MTc3IC04LjY2NjgwMyw3LjI3MjMxMiBsIC0yLjA5MTczOCwyMy45MDg2NyBjIC0wLjM4NjI3NCw0LjQxNTE0IDIuODU3MTc3LDguMjgwNTMgNy4yNzIzMTIsOC42NjY4MSBsIDkuMTI1Mjk4LDAuNzk4MzYgYyA0LjY2NzM4NSwyMC4zMzgyIDE4LjgxNTMxNiwzNy4xOTkwNCAzOC4wMzQwNDksNDUuMzI3MjEgbCAtMC43OTgzNjEsOS4xMjUzIGMgLTAuMzg2Mjc0LDQuNDE1MTMgMi44NTcxNzcsOC4yODA1MyA3LjI3MjMxMiw4LjY2NjggbCAyMy45MDg2NywyLjA5MTc0IGMgNC40MTUxNCwwLjM4NjI3IDguMjgwNTMsLTIuODU3MTggOC42NjY4MSwtNy4yNzIzMSBsIDAuNzk4MzYsLTkuMTI1MyBjIDIwLjMzODIsLTQuNjY3MzggMzcuMTk5MDQsLTE4LjgxNTMxIDQ1LjMyNzIxLC0zOC4wMzQwNSBsIDkuMTI1MywwLjc5ODM2IGMgNC40MTUxMywwLjM4NjI4IDguMjgwNTMsLTIuODU3MTggOC42NjY4LC03LjI3MjMxIGwgMi4wOTE3NCwtMjMuOTA4NjczIGMgMC4zODYyNywtNC40MTUxMzUgLTIuODU3MTgsLTguMjgwNTI5IC03LjI3MjMxLC04LjY2NjgwMyBsIC05LjEzNTAzLC0wLjc5OTIxMSBDIDE2MS4xNjkzMiw2Ny42MzI2NDIgMTQ3LjAyNTQ3LDUwLjc3NjY0OCAxMjcuODEyNzQsNDIuNjQ4MzE5IGwgMC43OTkyMSwtOS4xMzUwMjggYyAwLjM4NjI4LC00LjQxNTEzNSAtMi44NTcxOCwtOC4yODA1MjkgLTcuMjcyMzEsLTguNjY2ODAzIHogbSA4Ljk5MTA0MywzNC45MTY0ODkgYyAyNC43NTgyNCwyLjE2NjA2NSA0My4wNzI4MiwyMy45OTI1MjggNDAuOTA2NzUsNDguNzUwNzcxIC0yLjE2NjA2LDI0Ljc1ODI0IC0yMy45OTI1Myw0My4wNzI4MiAtNDguNzUwNzY4LDQwLjkwNjc1IEMgNzMuODE5NzUsMTQ1LjE2MjcgNTUuNTA1MTczLDEyMy4zMzYyMyA1Ny42NzEyMzksOTguNTc3OTkyIDU5LjgzNzMwNCw3My44MTk3NSA4MS42NjM3NjcsNTUuNTA1MTczIDEwNi40MjIwMSw1Ny42NzEyMzkgWiBtIC0xLjc0MzEyLDE5LjkyMzg5NCBjIC0xMy43NTQ1NzUsLTEuMjAzMzcgLTI1Ljg4MDM4OCw4Ljk3MTM5NSAtMjcuMDgzNzU3LDIyLjcyNTk3NyAtMS4yMDMzNywxMy43NTQ1OCA4Ljk3MTM5NSwyNS44ODAzOSAyMi43MjU5NzcsMjcuMDgzNzYgMTMuNzU0NTgsMS4yMDMzNyAyNS44ODAzOSwtOC45NzE0IDI3LjA4Mzc2LC0yMi43MjU5OCAxLjIwMzM3LC0xMy43NTQ1NzUgLTguOTcxNCwtMjUuODgwMzg4IC0yMi43MjU5OCwtMjcuMDgzNzU3IHoiCiAgICAgc3R5bGU9ImZpbGw6I2ZmZmZmZjtzdHJva2Utd2lkdGg6MDtzdHJva2UtbGluZWNhcDpyb3VuZDtwYWludC1vcmRlcjpzdHJva2UgZmlsbCBtYXJrZXJzIgogICAgIGlkPSJwYXRoMTAiIC8+Cjwvc3ZnPgo8IS0tcm90YXRpb25DZW50ZXI6MTAyLjU6MTAyLjUtLT4KCg==";
  const BLOCK_ICON =
    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcKICAgdmVyc2lvbj0iMS4xIgogICB3aWR0aD0iMTE3LjMzMzMzIgogICBoZWlnaHQ9IjExNy4zMzMzMyIKICAgdmlld0JveD0iMCAwIDExNy4zMzMzMyAxMTcuMzMzMzMiCiAgIGlkPSJzdmcxNCIKICAgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIgogICB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcwogICAgIGlkPSJkZWZzMTQiIC8+CiAgPHBhdGgKICAgICBkPSJNIDU1LjI1NjU4LDUuMDE5NjkyMSBDIDUyLjI4NjM4OSw0Ljc1OTgzNDIgNDkuNjg2MDI0LDYuOTQxNzk5MSA0OS40MjYxNjYsOS45MTE5OSBsIC0wLjUzNzA4LDYuMTM4ODU2IEMgMzUuMjA2OTgxLDE5LjE5MDczNCAyMy44NjQxOTMsMjguNzA4NDYzIDE4LjM5NjEzNiw0MS42Mzc0NyBMIDEyLjI1NzI3OSw0MS4xMDAzODkgQyA5LjI4NzA4NzYsNDAuODQwNTMxIDYuNjg2NzIzNiw0My4wMjI0OTYgNi40MjY4NjU3LDQ1Ljk5MjY4NyBMIDUuMDE5NjkyLDYyLjA3Njc1MiBjIC0wLjI1OTg1NzksMi45NzAxOTUgMS45MjIxMDcsNS41NzA1NTcgNC44OTIyOTgsNS44MzA0MTggbCA2LjEzODg1NiwwLjUzNzA4MSBjIDMuMTM5ODg3LDEzLjY4MjEwMyAxMi42NTc2MTcsMjUuMDI0ODg2IDI1LjU4NjYyNCwzMC40OTI5NDUgbCAtMC41MzcwODEsNi4xMzg4NTQgYyAtMC4yNTk4NTgsMi45NzAxOSAxLjkyMjEwNyw1LjU3MDU2IDQuODkyMjk4LDUuODMwNDEgbCAxNi4wODQwNjYsMS40MDcxOCBjIDIuOTcwMTk1LDAuMjU5ODUgNS41NzA1NTcsLTEuOTIyMTEgNS44MzA0MTksLTQuODkyMyBsIDAuNTM3MDgsLTYuMTM4ODYgQyA4Mi4xMjYzNTUsOTguMTQyNjAyIDkzLjQ2OTEzOCw4OC42MjQ4NzMgOTguOTM3MTk3LDc1LjY5NTg2MiBsIDYuMTM4ODUzLDAuNTM3MDggYyAyLjk3MDE5LDAuMjU5ODYyIDUuNTcwNTYsLTEuOTIyMTA5IDUuODMwNDEsLTQuODkyMjk3IGwgMS40MDcxOCwtMTYuMDg0MDY1IGMgMC4yNTk4NSwtMi45NzAxOTEgLTEuOTIyMTEsLTUuNTcwNTU2IC00Ljg5MjMsLTUuODMwNDE0IGwgLTYuMTQ1NCwtMC41Mzc2NTIgQyA5OC4xMzUyNDMsMzUuMjEwMzcgODguNjIwMjU5LDIzLjg3MDg0NyA3NS42OTUyOTEsMTguNDAyNjgxIGwgMC41Mzc2NTIsLTYuMTQ1NDAyIEMgNzYuNDkyODA1LDkuMjg3MDg3NiA3NC4zMTA4MzQsNi42ODY3MjM2IDcxLjM0MDY0Niw2LjQyNjg2NTggWiBNIDYxLjMwNTExOSwyOC41MDkwNDEgQyA3Ny45NjA3MTQsMjkuOTY2MjE3IDkwLjI4MTQ3LDQ0LjY0OTUyMSA4OC44MjQyOTEsNjEuMzA1MTE4IDg3LjM2NzExOSw3Ny45NjA3MTMgNzIuNjgzODExLDkwLjI4MTQ3IDU2LjAyODIxNyw4OC44MjQyOTEgMzkuMzcyNjE5LDg3LjM2NzExOCAyNy4wNTE4NjUsNzIuNjgzODEgMjguNTA5MDQxLDU2LjAyODIxNyAyOS45NjYyMTcsMzkuMzcyNjIgNDQuNjQ5NTIsMjcuMDUxODY1IDYxLjMwNTExOSwyOC41MDkwNDEgWiBtIC0xLjE3MjY0OCwxMy40MDMzOSBjIC05LjI1MzEwNywtMC44MDk1NDMgLTE3LjQxMDQ5OSw2LjAzNTMyMSAtMTguMjIwMDQsMTUuMjg4NDMzIC0wLjgwOTU0Myw5LjI1MzExIDYuMDM1MzIxLDE3LjQxMDQ5NyAxNS4yODg0MzMsMTguMjIwMDQgOS4yNTMxMTEsMC44MDk1NDIgMTcuNDEwNDk4LC02LjAzNTMyNSAxOC4yMjAwNCwtMTUuMjg4NDM0IEMgNzYuMjMwNDQ3LDUwLjg3OTM2NCA2OS4zODU1OCw0Mi43MjE5NzIgNjAuMTMyNDcxLDQxLjkxMjQzMSBaIgogICAgIHN0eWxlPSJmaWxsOiNmZmZmZmY7c3Ryb2tlOiMwMDAwMDA7c3Ryb2tlLXdpZHRoOjkuOTk5OTk7c3Ryb2tlLWxpbmVjYXA6cm91bmQ7c3Ryb2tlLWRhc2hhcnJheTpub25lO3N0cm9rZS1vcGFjaXR5OjAuMTQ5MDI7cGFpbnQtb3JkZXI6c3Ryb2tlIGZpbGwgbWFya2VycyIKICAgICBpZD0icGF0aDEwIiAvPgo8L3N2Zz4KPCEtLXJvdGF0aW9uQ2VudGVyOjU4LjY2NjY2NjY2NjY2NjY2OjU4LjY2NjY2NjY2NjY2NjY2LS0+Cgo=";
  const TARGET_BLOCK_TYPE = {
    blockType: Scratch.BlockType.REPORTER,
    blockShape: Scratch.BlockShape.OCTAGONAL,
    forceOutputType: CDT_TARGET_LINK_ID,
  };
  const TARGET_ARG_TYPE = {
    shape: Scratch.BlockShape.OCTAGONAL,
    check: CDT_TARGET_LINK_ID,
  };

  class TargetLink {
    customId = CDT_TARGET_LINK_ID;

    constructor(target) {
      this.target = target;
    }

    toMonitorContent() {
      let el = document.createElement("div");
      Object.assign(el.style, {
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "4.5rem",
        height: "4rem",
        border: "1px solid var(--ui-black-transparent)",
        borderRadius: "0.25rem",
        userSelect: "none",
      });

      if (this.target) {
        let imgOuter = document.createElement("div");
        Object.assign(imgOuter.style, {
          position: "relative",
          width: "100%",
          height: "100%",
        });
        el.append(imgOuter);

        let imgInner = document.createElement("div");
        Object.assign(imgInner.style, {
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          position: "absolute",
          width: "100%",
          height: "100%",
        });
        imgOuter.append(imgInner);

        let img = document.createElement("img");
        img.src = this.target.getCurrentCostume().asset.encodeDataURI();
        img.draggable = false;
        Object.assign(img.style, {
          maxWidth: "32px",
          maxHeight: "32px",
          filter: "drop-shadow(0px 0px 2px var(--ui-black-transparent))",
        });
        imgInner.append(img);
      }

      let info = document.createElement("div");
      Object.assign(info.style, {
        padding: "0.25rem",
        fontSize: "0.625rem",
      });
      el.append(info);

      let nameLabel = document.createElement("div");
      nameLabel.textContent = this.target
        ? this.target.getName()
        : Scratch.translate("Unknown");
      Object.assign(nameLabel.style, {
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      });
      info.append(nameLabel);

      if (!this.isActualLink || !this.target.isOriginal) {
        let detailsLabel = document.createElement("div");
        if (!this.isActualLink) {
          detailsLabel.textContent = Scratch.translate("exposed");
        } else if (!this.target.isOriginal) {
          detailsLabel.textContent = Scratch.translate("clone");
        }
        Object.assign(detailsLabel.style, {
          marginTop: "0.125rem",
          fontSize: "0.5rem",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        });
        info.append(detailsLabel);
      }

      return el;
    }

    toReporterContent() {
      return this.toMonitorContent();
    }

    toReporterJSONItem() {
      let el = document.createElement("i");
      el.textContent = this.target
        ? `Target(${this.target.getName()})`
        : "Target";
      return el;
    }

    toListItem() {
      return this.toReporterJSONItem();
    }

    toListEditor() {
      return this.target
        ? `Target(${this.target.getName()})`
        : "Target";
    }

    get isActualLink() {
      return !!(
        this.target &&
        runtime.executableTargets.includes(this.target)
      )
    }
  }
  runtime[`cdt_${CDT_TARGET_LINK_ID}`] = TargetLink;

  class Targets {
    constructor() {
      this.targetProps = Object.assign(Object.create(null), {
        "name": {
          get name() {
            return Scratch.translate("name");
          },
          getValue: (target) => target.getName(),
        },
        "costume/backdrop #": {
          get name() {
            return Scratch.translate("costume/backdrop #");
          },
          getValue: (target) => target.currentCostume + 1,
          setValue: (target, value) => {
            value = Cast.toNumber(value) - 1;
            target.setCostume(value);
          },
        },
        "costume/backdrop name": {
          get name() {
            return Scratch.translate("costume/backdrop name");
          },
          getValue: (target) => target.getCurrentCostume().name,
        },
        "volume": {
          get name() {
            return Scratch.translate("volume");
          },
          getValue: (target) => target.volume,
          setValue: (target, value) => runtime.ext_scratch3_sound.setVolume(
            { VOLUME: value },
            { target },
          ),
        },
        "stage": {
          isBoolean: true,
          get name() {
            return Scratch.translate("stage");
          },
          getValue: (target) => target.isStage,
        },
        "clones": {
          get name() {
            return Scratch.translate("clones");
          },
          getValue: (target) => {
            const clones = [];
            target.sprite.clones.forEach((cloneTarget) => {
              if (!cloneTarget.isOriginal) clones.push(new TargetLink(cloneTarget));
            });
            return clones;
          },
        },
        "origin": {
          get name() {
            return Scratch.translate("origin");
          },
          getValue: (target) => {
            return new TargetLink(target.sprite.clones.find((cloneTarget) => cloneTarget.isOriginal) || null);
          },
        },
        "x position": {
          get name() {
            return Scratch.translate("x position");
          },
          getValue: (target) => target.x,
          setValue: (target, value) => {
            value = Cast.toNumber(value);
            target.setXY(value, target.y);
          },
        },
        "y position": {
          get name() {
            return Scratch.translate("y position");
          },
          getValue: (target) => target.y,
          setValue: (target, value) => {
            value = Cast.toNumber(value);
            target.setXY(target.x, value);
          },
        },
        "position": {
          get name() {
            return Scratch.translate("position");
          },
          getValue: (target) => [target.x, target.y],
          setValue: (target, value) => {
            let [x, y] = Cast.toList(value);
            x = Cast.toNumber(x);
            y = Cast.toNumber(y);
            target.setXY(x, y);
          },
        },
        "direction": {
          get name() {
            return Scratch.translate("direction");
          },
          getValue: (target) => target.direction,
          setValue: (target, value) => {
            value = Cast.toNumber(value);
            target.setDirection(value);
          },
        },
        "rotation style": {
          get name() {
            return Scratch.translate("rotation style");
          },
          getValue: (target) => target.rotationStyle,
        },
        "size": {
          get name() {
            return Scratch.translate("size");
          },
          getValue: (target) => target.size,
          setValue: (target, value) => {
            value = Cast.toNumber(value);
            target.setSize(value);
          },
        },
        "stretch x": { // Support for TurboWarp's Stretch extension
          get name() {
            return Scratch.translate("stretch x");
          },
          get hide() {
            return !vm.extensionManager.isExtensionLoaded("stretch");
          },
          getValue: function(target) {
            if (this.hide) return null;

            // Dirty hacks
            const stretchXSymbol = Object.getOwnPropertySymbols(target)
              .find((symbol) => symbol.description === "stretch.x");
            if (!stretchXSymbol) return null;

            return target[stretchXSymbol];
          },
          setValue: function(target, value) {
            if (this.hide) return;

            // Dirty hacks
            const stretchXSymbol = Object.getOwnPropertySymbols(target)
              .find((symbol) => symbol.description === "stretch.x");
            if (!stretchXSymbol) return;

            value = Cast.toNumber(value);
            target[stretchXSymbol] = value;
            target.setDirection(target.direction);
          },
        },
        "stretch y": { // Support for TurboWarp's Stretch extension
          get name() {
            return Scratch.translate("stretch y");
          },
          get hide() {
            return !vm.extensionManager.isExtensionLoaded("stretch");
          },
          getValue: function(target) {
            if (this.hide) return null;

            // Dirty hacks
            const stretchYSymbol = Object.getOwnPropertySymbols(target)
              .find((symbol) => symbol.description === "stretch.y");
            if (!stretchYSymbol) return null;

            return target[stretchYSymbol];
          },
          setValue: function(target, value) {
            if (this.hide) return;

            // Dirty hacks
            const stretchYSymbol = Object.getOwnPropertySymbols(target)
              .find((symbol) => symbol.description === "stretch.y");
            if (!stretchYSymbol) return;

            value = Cast.toNumber(value);
            target[stretchYSymbol] = value;
            target.setDirection(target.direction);
          },
        },
        "stretch": { // Support for TurboWarp's Stretch extension
          get name() {
            return Scratch.translate("stretch");
          },
          get hide() {
            return !vm.extensionManager.isExtensionLoaded("stretch");
          },
          getValue: function(target) {
            if (this.hide) return null;

            // Dirty hacks
            const symbols = Object.getOwnPropertySymbols(target);
            const stretchXSymbol = symbols.find((symbol) => symbol.description === "stretch.x");
            const stretchYSymbol = symbols.find((symbol) => symbol.description === "stretch.y");
            if (!stretchXSymbol || !stretchYSymbol) return null;

            return [target[stretchXSymbol], target[stretchYSymbol]];
          },
          setValue: function(target, value) {
            if (this.hide) return;

            // Dirty hacks
            const symbols = Object.getOwnPropertySymbols(target);
            const stretchXSymbol = symbols.find((symbol) => symbol.description === "stretch.x");
            const stretchYSymbol = symbols.find((symbol) => symbol.description === "stretch.y");
            if (!stretchXSymbol || !stretchYSymbol) return;

            let [x, y] = Cast.toList(value);
            x = Cast.toNumber(x);
            y = Cast.toNumber(y);
            target[stretchXSymbol] = x;
            target[stretchYSymbol] = y;
            target.setDirection(target.direction);
          },
        },
        "blending": { // Support for Vadik1's Clipping and Blending extension
          get name() {
            return Scratch.translate("blending");
          },
          get hide() {
            return !vm.extensionManager.isExtensionLoaded("xeltallivclipblend");
          },
          getValue: function(target) {
            if (this.hide) return null;
            return target.blendMode || "default";
          },
        },
        "clipping box": { // Support for Vadik1's Clipping and Blending extension
          get name() {
            return Scratch.translate("clipping box");
          },
          get hide() {
            return !vm.extensionManager.isExtensionLoaded("xeltallivclipblend");
          },
          getValue: function(target) {
            if (this.hide || !target.clipbox) return null;
            const {
              x_min: x1,
              y_min: y1,
              x_max: x2,
              y_max: y2,
            } = target.clipbox
            return {
              x1,
              y1,
              x2,
              y2,
              width: x2 - x1,
              height: y2 - y1,
            };
          },
        },
        "visible": {
          isBoolean: true,
          get name() {
            return Scratch.translate("visible");
          },
          getValue: (target) => target.visible,
          setValue: (target, value) => {
            value = Cast.toBoolean(value);
            target.setVisible(value);
            runtime.ext_scratch3_looks._renderBubble(target);
          },
        },
        "draggable": {
          isBoolean: true,
          get name() {
            return Scratch.translate("draggable");
          },
          getValue: (target) => target.draggable,
          setValue: (target, value) => {
            value = Cast.toBoolean(value);
            target.setDraggable(value);
          },
        },
        "clone": {
          isBoolean: true,
          get name() {
            return Scratch.translate("clone");
          },
          getValue: (target) => !target.isOriginal,
        },
      });

      runtime.registerSerializer(
        CDT_TARGET_LINK_ID,
        (obj) => {
          if (!obj.target.isOriginal) return null;
          return obj.target.id;
        },
        (serialized) => {
          if (serialized === null) return new TargetLink(null);
          const target = runtime.getTargetById(serialized);
          if (!target) return new TargetLink(null);
          return new TargetLink(target);
        }
      );
    }

    getInfo() {
      return {
        id: EXT_ID,
        name: Scratch.translate("Targets"),
        menuIconURI: EXT_ICON,
        blockIconURI: BLOCK_ICON,
        color1: "#5058ce",
        color2: "#4850b9",
        color3: "#3f46a3",
        blocks: [
          {
            opcode: "targetLinkByName",
            ...TARGET_BLOCK_TYPE,
            text: Scratch.translate("[TARGET_NAME] target"),
            arguments: {
              TARGET_NAME: {
                menu: "TARGETS",
              },
            },
          },
          {
            opcode: "allTargets",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate("all targets"),
          },
          {
            opcode: "allSprites",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate("all sprites"),
          },
          {
            opcode: "allSpritesAsObject",
            blockType: Scratch.BlockType.OBJECT,
            text: Scratch.translate("all sprites"),
          },
          "---",
          {
            opcode: "createCloneOfTargetAndReturn",
            ...TARGET_BLOCK_TYPE,
            text: Scratch.translate("create clone of target [TARGET]"),
            arguments: {
              TARGET: TARGET_ARG_TYPE,
            },
          },
          {
            opcode: "createCloneOfTarget",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("create clone of target [TARGET]"),
            arguments: {
              TARGET: TARGET_ARG_TYPE,
            },
          },
          {
            opcode: "deleteClone",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("delete clone [CLONE]"),
            arguments: {
              CLONE: TARGET_ARG_TYPE,
            },
          },
          "---",
          {
            opcode: "targetIsActual",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("target [TARGET] is actual?"),
            arguments: {
              TARGET: TARGET_ARG_TYPE,
            },
          },
          {
            opcode: "propertyOfTarget",
            blockType: Scratch.BlockType.REPORTER,
            allowDropAnywhere: true,
            text: Scratch.translate("[PROPERTY] of target [TARGET]"),
            arguments: {
              PROPERTY: {
                menu: "TARGET_PROPS",
              },
              TARGET: TARGET_ARG_TYPE,
            },
          },
          {
            opcode: "boolPropertyOfTarget",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("target [TARGET] is [PROPERTY]?"),
            arguments: {
              TARGET: TARGET_ARG_TYPE,
              PROPERTY: {
                menu: "TARGET_BOOL_PROPS",
              },
            },
          },
          {
            opcode: "setPropertyOfTarget",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("set [PROPERTY] of target [TARGET] to [VALUE]"),
            arguments: {
              PROPERTY: {
                menu: "TARGET_WRITABLE_PROPS",
              },
              TARGET: TARGET_ARG_TYPE,
              VALUE: {
                type: Scratch.ArgumentType.STRING,
              }
            },
          },
          "---",
          {
            opcode: "getVariableOfTarget",
            blockType: Scratch.BlockType.REPORTER,
            allowDropAnywhere: true,
            text: Scratch.translate("var [VAR_NAME] of target [TARGET]"),
            arguments: {
              VAR_NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("my variable"),
              },
              TARGET: TARGET_ARG_TYPE,
            },
          },
          {
            opcode: "setVariableOfTarget",
            blockType: Scratch.BlockType.COMMAND,
            text: Scratch.translate("set var [VAR_NAME] of target [TARGET] to [VALUE]"),
            arguments: {
              VAR_NAME: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: Scratch.translate("my variable"),
              },
              TARGET: TARGET_ARG_TYPE,
              VALUE: {
                type: Scratch.ArgumentType.STRING,
              }
            },
          },
          "---",
          {
            opcode: "targetsTouchingTarget",
            blockType: Scratch.BlockType.ARRAY,
            text: Scratch.translate("targets touching target [TARGET]"),
            arguments: {
              TARGET: TARGET_ARG_TYPE,
            },
          },
          {
            opcode: "targetsAreTouching",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("targets [TARGET1] and [TARGET2] are touching?"),
            arguments: {
              TARGET1: TARGET_ARG_TYPE,
              TARGET2: TARGET_ARG_TYPE,
            },
          },
          {
            opcode: "targetIsTouchingObject",
            blockType: Scratch.BlockType.BOOLEAN,
            text: Scratch.translate("target [TARGET] is touching [OBJECT]?"),
            arguments: {
              TARGET: TARGET_ARG_TYPE,
              OBJECT: {
                menu: "OBJECTS",
              },
            },
          },
          "---",
          {
            opcode: "runAsTarget",
            blockType: Scratch.BlockType.CONDITIONAL,
            text: Scratch.translate("as within target [TARGET] do"),
            arguments: {
              TARGET: TARGET_ARG_TYPE,
            },
          },
        ],
        menus: {
          TARGETS: {
            acceptReporters: true,
            items: "_getTargets",
          },
          TARGET_PROPS: {
            acceptReporters: true,
            items: "_getTargetProps",
          },
          TARGET_BOOL_PROPS: {
            acceptReporters: true,
            items: "_getTargetBoolProps",
          },
          TARGET_WRITABLE_PROPS: {
            acceptReporters: true,
            items: "_getTargetWritableProps",
          },
          OBJECTS: {
            acceptReporters: true,
            items: [
              { text: "mouse-pointer", value: "_mouse_" },
              { text: "edge", value: "_edge_" },
            ],
          },
        },
      };
    }

    getCompileInfo () {
      return {
        ir: {
          runAsTarget: function (block) {
            return [{
              target: this.descendInputOfBlock(block, "TARGET"),
              do: this.descendSubstack(block, "SUBSTACK"),
            }];
          },
        },
        js: {
          runAsTarget: function (_, node, { Frame }) {
            const oldTarget = this.localVariables.next();
            const substituteTargetLink = this.localVariables.next();
            this.source += `const ${oldTarget} = target;\n`;
            this.source += `const ${substituteTargetLink} = ${this.descendInput(node.target)};\n`;
            this.source += `if (runtime.ext_${EXT_ID}._isActualTargetLink(${substituteTargetLink})) {\n`;
            this.source += `  const target = ${substituteTargetLink}.target;\n`;
            this.source += `  thread.compatibilitySubstituteTarget = ${substituteTargetLink}.target;\n`;
            this.descendStack(node.do, new Frame(false));
            this.source += `  thread.compatibilitySubstituteTarget = thread.target === ${oldTarget} ? null : ${oldTarget};\n`;
            this.source += '}\n';
          },
        }
      };
    }

    // Menu Functions
    _getTargets() {
      const targetNames = [
        { text: Scratch.translate("myself"), value: "_myself_" },
        { text: Scratch.translate("Stage"), value: "_stage_" },
      ];
      runtime.targets.forEach((target) => {
        if (!target.isStage && target.isOriginal)
          targetNames.push({ text: target.getName(), value: target.getName() });
      });
      return targetNames;
    }

    _getTargetProps() {
      const items = [];
      Object.entries(this.targetProps).forEach(([value, propInfo]) => {
        if (!propInfo.isBoolean && !propInfo.hide)
          items.push({ text: propInfo.name, value });
      });
      return items;
    }

    _getTargetBoolProps() {
      const items = [];
      Object.entries(this.targetProps).forEach(([value, propInfo]) => {
        if (propInfo.isBoolean && !propInfo.hide)
          items.push({ text: propInfo.name, value });
      });
      return items;
    }

    _getTargetWritableProps() {
      const items = [];
      Object.entries(this.targetProps).forEach(([value, propInfo]) => {
        if (propInfo.setValue && !propInfo.hide)
          items.push({ text: propInfo.name, value });
      });
      return items;
    }

    // Utilites
    _getTarget(name, util) {
      name = Cast.toString(name);
      if (name === "_stage_") {
        return runtime.getTargetForStage();
      } else if (name === "_myself_") {
        return util.target;
      } else {
        return runtime.getSpriteTargetByName(name);
      }
    }

    _isActualTargetLink(targetLink) {
      return !!(
        targetLink instanceof TargetLink &&
        targetLink.isActualLink
      );
    }

    // Block Functions
    allTargets() {
      return runtime.targets.map((target) => new TargetLink(target));
    }

    allSprites() {
      const sprites = [];
      runtime.targets.forEach((target) => {
        if (!target.isStage && target.isOriginal) sprites.push(new TargetLink(target));
      });
      return sprites;
    }

    allSpritesAsObject() {
      const sprites = {};
      runtime.targets.forEach((target) => {
        if (!target.isStage && target.isOriginal)
          sprites[target.getName()] = new TargetLink(target);
      });
      return sprites;
    }

    targetLinkByName(args, util) {
      const target = this._getTarget(args.TARGET_NAME, util);
      if (!target) return "";

      return new TargetLink(target);
    }

    createCloneOfTargetAndReturn(args) {
      if (!this._isActualTargetLink(args.TARGET)) return "";
      const target = args.TARGET.target;

      const cloneTarget = target.makeClone();
      if (!cloneTarget) return "";

      runtime.addTarget(cloneTarget);
      cloneTarget.goBehindOther(target);
      return new TargetLink(cloneTarget);
    }

    createCloneOfTarget(args) {
      this.createCloneOfTargetAndReturn(args);
    }

    deleteClone(args) {
      if (!this._isActualTargetLink(args.CLONE)) return;
      const target = args.CLONE.target;
      if (target.isOriginal) return;

      runtime.disposeTarget(target);
      runtime.stopForTarget(target);
    }

    targetIsActual(args) {
      return this._isActualTargetLink(args.TARGET);
    }

    propertyOfTarget(args) {
      if (!this._isActualTargetLink(args.TARGET)) return "";
      const target = args.TARGET.target;

      const property = Cast.toString(args.PROPERTY);
      if (
        !this.targetProps[property] ||
        this.targetProps[property].isBoolean
      ) return "";

      return this.targetProps[property]?.getValue?.(target) ?? "";
    }

    boolPropertyOfTarget(args) {
      if (!this._isActualTargetLink(args.TARGET)) return false;
      const target = args.TARGET.target;

      const property = Cast.toString(args.PROPERTY);
      if (!this.targetProps[property]?.isBoolean) return false;

      return this.targetProps[property]?.getValue?.(target) ?? false;
    }

    setPropertyOfTarget(args) {
      if (!this._isActualTargetLink(args.TARGET)) return;
      const target = args.TARGET.target;

      const property = Cast.toString(args.PROPERTY);
      if (!this.targetProps[property]?.setValue) return;

      this.targetProps[property]?.setValue?.(target, args.VALUE);
    }

    getVariableOfTarget(args) {
      if (!this._isActualTargetLink(args.TARGET)) return "";
      const target = args.TARGET.target;

      const varName = Cast.toString(args.VAR_NAME);
      const variable = target.lookupVariableByNameAndType(varName, "");
      if (!variable) return "";

      return variable.value;
    }

    setVariableOfTarget(args, util) {
      if (!this._isActualTargetLink(args.TARGET)) return;
      const target = args.TARGET.target;

      const varName = Cast.toString(args.VAR_NAME);
      const variable = target.lookupVariableByNameAndType(varName, "");
      if (!variable) return;

      variable.value = args.VALUE;
      if (variable.isCloud) {
        util.ioQuery("cloud", "requestUpdateVariable", [variable.name, args.VALUE]);
      }
    }

    targetsTouchingTarget(args) {
      if (!this._isActualTargetLink(args.TARGET)) return [];
      const target1 = args.TARGET.target;

      const targets = [];
      runtime.targets.forEach((target2) => {
        if (
          target1 !== target2 &&
          !target2.isStage &&
          target1.isTouchingTarget(target2)
        )
          targets.push(new TargetLink(target2));
      });
      return targets;
    }

    targetsAreTouching(args) {
      if (
        !this._isActualTargetLink(args.TARGET1) ||
        !this._isActualTargetLink(args.TARGET2)
      ) return false;
      const target1 = args.TARGET1.target;
      const target2 = args.TARGET2.target;

      return target1.isTouchingTarget(target2);
    }

    targetIsTouchingObject(args) {
      if (!this._isActualTargetLink(args.TARGET)) return false;
      const target = args.TARGET.target;

      const object = Cast.toString(args.OBJECT);
      if (!["_mouse_", "_edge_"].includes(object)) return false;

      return target.isTouchingObject(object);
    }

    runAsTarget(args, util) {
      if (!this._isActualTargetLink(args.TARGET)) return false;
      const target = args.TARGET.target;

      if (target !== util.target) {
        util.thread.peekStackFrame().substituteTarget = target;
      }
      return true;
    }
  }
  const extension = new Targets();
  runtime[`ext_${EXT_ID}`] = extension;
  Scratch.extensions.register(extension);
})(Scratch);
