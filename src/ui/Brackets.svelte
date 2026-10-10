<!-- Four 1px corner marks around the parent: the focus of a tile. They move instantly; nothing grows.
     The parent is positioned. -->
<span class="b tl"></span><span class="b tr"></span><span class="b bl"></span><span class="b br"></span>

<style>
  .b {
    position: absolute;
    width: 1.4rem;
    height: 1.4rem;
    border: 0 solid var(--sel-frame);
    pointer-events: none;
  }
  .tl { top: -.5rem; left: -.5rem; border-width: 1px 0 0 1px; }
  .tr { top: -.5rem; right: -.5rem; border-width: 1px 1px 0 0; }
  .bl { bottom: -.5rem; left: -.5rem; border-width: 0 0 1px 1px; }
  .br { bottom: -.5rem; right: -.5rem; border-width: 0 1px 1px 0; }
</style>
