

function htmlToElement(input) {
  if (input instanceof DocumentFragment) {
    return input;
  }
  if (input instanceof Element) {
    const frag = document.createDocumentFragment();
    frag.appendChild(input);
    return frag;
  }

  const tmp = document.createElement('template');
  tmp.innerHTML = (typeof input === 'string' ? input.trim() : '');

  if (tmp.content.childElementCount === 0) {
    const emptyDiv = document.createElement('div');
    const frag = document.createDocumentFragment();
    frag.appendChild(emptyDiv);
    return frag;
  }
  return tmp.content;
}

function tcCreateButton(serviceId, rowId, button, buttonOptions = {}) {
  const svgKeyMap = {
    share: "share",
    rtc: "rtc",
    reset: "reset",
    delete: "delete",
    save: "save",
    create: "plus",
    start: "start",
    startblue: "start",
    startgreen: "start",
    new: "plus",
    open: "open",
    retry: "retry",
    cancel: "stop",
    stop: "stop"
  };

  const defaultTexts = {
    share: "Share",
    rtc: "RTC",
    reset: "Reset",
    delete: "Delete",
    save: "Save",
    create: "Create",
    start: "Start",
    startblue: "Start",
    startgreen: "Start",
    new: "New",
    open: "Open",
    retry: "Retry",
    cancel: "Cancel",
    stop: "Stop"
  };

  const buttonClasses = {
    share: "",
    rtc: buttonOptions.show === false ? "d-none" : "",
    reset: "btn-danger",
    delete: "btn-danger",
    save: "btn-success",
    create: "btn-primary",
    start: "btn-success",
    startblue: "btn-primary",
    startgreen: "btn-success",
    new: "btn-primary",
    open: "btn-success",
    retry: "btn-success",
    cancel: "btn-danger",
    stop: "btn-success"
  };

  const clazz = buttonClasses[button] || "";
  const svgKey = svgKeyMap[button];
  const svgicon = svgKey ? getSvg(svgKey) : "";
  const buttontext = buttonOptions.text || defaultTexts[button] || "";
  const alignClass = buttonOptions.alignRight ? "ms-auto" : "me-2";

  let dependencyAttrs = "";
  if (buttonOptions.dependency) {
    for (const [key, values] of Object.entries(buttonOptions.dependency)) {
      dependencyAttrs += ` data-dependency-${key}="true"`;
      for (const value of values) {
        dependencyAttrs += ` data-dependency-${key}-${value}="true"`;
      }
    }
  }

  const content = buttonOptions.textFirst
    ? `${buttontext} ${svgicon}`
    : `${svgicon} ${buttontext}`;

  const html = `
    <button 
      type="button"
      data-service="${serviceId}"
      data-row="${rowId}"
      id="${serviceId}-${rowId}-${button}-btn"
      class="btn ${clazz} ${alignClass}"
      ${dependencyAttrs}
    >
      ${content}
    </button>
  `.trim();
  return html;
}

function tcCreateModal(serviceId, rowId) {
  const modalId = `${serviceId}-${rowId}-modal`;
  const copyBtnId = `${serviceId}-${rowId}-modal-copy-btn`;

  const html = `
    <div class="modal fade" id="${modalId}" role="dialog" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">

          <div class="modal-header">
            <h4 class="modal-title" style="color: black">Share Workshop</h4>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div class="modal-body">
            <p style="color: black">Share your configuration</p>
            <a href="" target="_blank"></a>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-default" data-bs-dismiss="modal">Close</button>
            <button 
              type="button" 
              data-service="${serviceId}" 
              data-row="${rowId}" 
              id="${copyBtnId}" 
              class="btn btn-outline-primary" 
              data-bs-toggle="tooltip" 
              data-bs-placement="top" 
              title="Copy to clipboard"
            >
              Copy URL
            </button>
          </div>

        </div>
      </div>
    </div>
  `.trim();

  return html;
}

function tcCreateButtons(serviceId, rowId, elementOptions, isFirstRow) {
  if ( ["share", "start"].includes(pageType(null)) ){
    return tcCreateModal(serviceId, rowId);
  }
  let buttonsAdded = false;
  let html = `<hr>\n`;
  const buttonsDivId = `${serviceId}-${rowId}-buttons-div`;
  html += `<div class="d-flex" id="${buttonsDivId}" role="dialog" tabindex="-1">\n`;

  const buttons = (
    elementOptions?.input?.options?.buttons || []
  );

  for (const button of buttons) {
    const buttonOptions =
      elementOptions?.input?.options?.[button] || {};

    const shouldRender =
      (isFirstRow && buttonOptions.firstRow !== false) ||
      (!isFirstRow && buttonOptions.defaultRow !== false);

    if (shouldRender) {
      html += tcCreateButton(serviceId, rowId, button, buttonOptions) + "\n";
      buttonsAdded = true;
    }
  }

  if ( !buttonsAdded ) {
    return tcCreateModal(serviceId, rowId);
  } else {
    html += `</div>\n`;
    html += tcCreateModal(serviceId, rowId);
  
    return html.trim();
  }    
}


function tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions = {}) {
  const label = elementOptions.label || {};
  const labelType = label.type || "";
  const labelValue = label.value || "";
  const labelOptions = label.options || {};
  const width = label.width || "4";
  const tooltipIcon = getSvg("info");

  let innerHTML = "";

  // Add text or combinations
  if (
    ["text", "texticon", "texticonclick", "texticonclickcheckbox", "textcheckbox", "texticoncheckbox"]
      .includes(labelType)
  ) {
    if (typeof labelValue === "string") {
      innerHTML += labelValue;
    }
  }

  // Add icon with tooltip
  if (["texticon", "texticoncheckbox"].includes(labelType)) {
    innerHTML += `
      <a class="lh-1 ms-3" style="padding-top: 1px;" 
         data-bs-toggle="tooltip" data-bs-placement="right" data-bs-html="true"
         title="${label.icontext || ""}">
        ${tooltipIcon}
      </a>
    `;
  }

  // Icon with click behavior
  if (labelType === "texticonclick") {
    innerHTML += `
      <button type="button" class="btn"
        data-bs-toggle="tooltip" data-bs-placement="right" data-bs-html="true"
        title="${label.icontext || ""}">
        ${tooltipIcon}
        <span class="text-muted" style="font-size: smaller">(click me)</span>
      </button>
    `;
  }

  // Checkbox
  if (
    ["textcheckbox", "texticoncheckbox", "texticonclickcheckbox"]
      .includes(labelType)
  ) {
    const checkboxId = `${idPrefix}-${elementId}-input-cb`;
    const alignRight = labelOptions["align-right"] !== false;
    const checked = labelOptions.default === true;
    const enabled = labelOptions.enabled !== false;
    const name = labelOptions.name || null;

    const ignoreKeys = [
      "name", "value", "show", "align-right",
      "placeholder", "pattern", "warning", "required"
    ];

    let dataAttrs = `
      data-service="${serviceId}"
      data-row="${rowId}"
      data-tab="${tabId}"
      data-element="${elementId}"
      data-enabled="${String(enabled).toLowerCase()}"
      data-label-input="true"
      data-checked="${String(checked).toLowerCase()}"
      ${checked ? "checked" : ""}
      ${!enabled ? 'disabled="true"' : ""}
      ${name ? `name="${name}"` : ""}
    `;

    // Add dependency attributes
    if (elementOptions.dependency) {
      for (const [key, values] of Object.entries(elementOptions.dependency)) {
        dataAttrs += ` data-dependency-${key}="true"`;
        for (const value of values) {
          dataAttrs += ` data-dependency-${key}-${value}="true"`;
        }
      }
    }

    // Add all other data-* attributes from label.options
    for (const [key, value] of Object.entries(labelOptions)) {
      if (!ignoreKeys.includes(key)) {
        if (typeof value === "string" || typeof value === "boolean") {
          dataAttrs += ` data-${key}="${String(value).toLowerCase()}"`;
        }
      }
    }

    // Add default group if missing
    if (!("group" in labelOptions)) {
      dataAttrs += ` data-group="default"`;
    }

    const checkbox = `
      <input type="checkbox"
        id="${checkboxId}"
        class="form-check-input"
        style="margin-left: ${alignRight ? 'auto' : '.5em'};"
        ${dataAttrs.trim()}
      />
    `;

    innerHTML += checkbox;
  }

  // Header
  if (labelType === "header") {
    innerHTML += `<h4>${labelValue}</h4>`;
  }

  const labelFor = labelType === "header" ? '' : `for="${idPrefix}-${elementId}-input"`;
  const html = `
    <div class="col-${width} col-form-label d-flex align-items-start justify-content-between">
      <label ${labelFor} class="d-flex align-items-center w-100">
        ${innerHTML}
      </label>
    </div>
  `.trim();

  return html;
}


function tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions = {}, defineShow = false, collect = true) {
  const inputOptions = elementOptions?.input?.options || {};
  const dependencies = elementOptions?.dependency || {};
  const type = elementOptions?.input?.type || "default";

  const ignoreKeys = [
    "name", "value", "show", "align-right", "placeholder", "pattern",
    "warning", "required", "collect-static"
  ];

  const attrs = {
    "data-service": serviceId,
    "data-row": rowId,
    "data-tab": tabId,
    "data-type": type,
    "data-element": elementId
  };

  // Additional data-* attributes from input.options
  for (const [key, value] of Object.entries(inputOptions)) {
    if (!ignoreKeys.includes(key)) {
      if (typeof value === "string" || typeof value === "boolean") {
        attrs[`data-${key}`] = String(value).toLowerCase();
      }
    }
  }

  // Add data-group if missing
  if (!("group" in inputOptions)) {
    attrs["data-group"] = "default";
  }

  // Add collect flag
  if (collect && !("collect" in inputOptions)) {
    attrs["data-collect"] = "false";
  }

  // Add data-collect-static (as a flag, no value)
  if (inputOptions["collectstatic"]) {
    attrs["data-collect-static"] = "";
  }

  // Basic input attributes
  if (inputOptions["size"]) {
    attrs["size"] = inputOptions["size"];
  }

  if (inputOptions["multiple"]) {
    attrs["multiple"] = "";
  }

  const enabled = inputOptions["enabled"] !== false ||
    (isWorkshopInstructor() && inputOptions["instructor"] === "enabled");

  if (!enabled) {
    attrs["disabled"] = "";
  }

  if (inputOptions["required"]) {
    attrs["required"] = "";
  }

  if (inputOptions["pattern"]) {
    attrs["pattern"] = inputOptions["pattern"];
  }

  if (inputOptions["placeholder"]) {
    attrs["placeholder"] = inputOptions["placeholder"];
  }

  if (inputOptions["value"]) {
    attrs["value"] = inputOptions["value"];
  }

  // Add dependency flags
  for (const [key, values] of Object.entries(dependencies)) {
    attrs[`data-dependency-${key}`] = "true";
    for (const val of values) {
      attrs[`data-dependency-${key}-${val}`] = "true";
    }
  }

  for ( const key of Object.keys( (elementOptions?.trigger || {}) ) ) {
    attrs[`data-trigger-${key}`] = "";
  }

  // Handle show/hide behavior
  if (defineShow) {
    const show = inputOptions["show"] !== false ||
      (isWorkshopInstructor() && inputOptions["instructor"] === "show");

    attrs["data-show"] = show ? "true" : "false";

    if (!inputOptions["show"] && !(isWorkshopInstructor() && inputOptions["instructor"] === "show")) {
      attrs["style"] = "display: none";
    }
  }

  return attrs;
}


function tcCreateMultipleCheckboxes(idPrefix, serviceId, rowId, tabId, elementId, elementOptions) {
  const wrapper = document.createElement("div");
  wrapper.id = `${idPrefix}-${elementId}-input-div`;
  Object.entries(tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, true, true))
    .forEach(([k, v]) => wrapper.setAttribute(k, v));

  const label = tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
  wrapper.appendChild(htmlToElement(label));

  const checkboxDiv = document.createElement("div");
  checkboxDiv.id = `${idPrefix}-${elementId}-checkboxes-div`;
  checkboxDiv.classList.add("row", "g-0");
  Object.entries(tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, false, true))
    .forEach(([k, v]) => checkboxDiv.setAttribute(k, v));

  wrapper.appendChild(checkboxDiv);

  return wrapper.outerHTML.trim();
}


function tcCreateLabelInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions) {
  const div = document.createElement("div");
  div.id = `${idPrefix}-${elementId}-input-div`;
  div.classList.add("row", "mb-1");

  Object.entries(tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, true, true))
    .forEach(([k, v]) => div.setAttribute(k, v));

  const label = tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
  div.appendChild(htmlToElement(label));

  return div.outerHTML.trim();
}

function tcCreateTextInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions) {
  const wrapper = document.createElement("div");
  wrapper.id = `${idPrefix}-${elementId}-input-div`;
  wrapper.classList.add("row", "mb-1");

  Object.entries(tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, true, true))
    .forEach(([k, v]) => wrapper.setAttribute(k, v));

  const label = tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
  wrapper.appendChild(htmlToElement(label));

  const colWidth = 12 - parseInt(elementOptions.label?.width || "4");
  const inputCol = document.createElement("div");
  inputCol.classList.add(`col-${colWidth}`, "d-flex", "flex-column", "justify-content-center");

  const secret = !!elementOptions?.input?.options?.secret;
  const copy = !!elementOptions?.input?.options?.copy;

  let inputGroup;
  if (secret || copy) {
    inputGroup = document.createElement("div");
    inputGroup.classList.add("input-group");
  }

  const input = document.createElement("input");
  input.type = secret ? "password" : "text";
  input.classList.add("form-control");

  Object.entries(tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, false, true))
    .forEach(([k, v]) => input.setAttribute(k, v));

  if (copy) input.setAttribute("data-copy-key", elementId);
  input.name = elementOptions?.input?.options?.name || elementId;
  input.id = `${idPrefix}-${elementId}-input`;

  if (secret || copy) {
    inputGroup.appendChild(input);
  }

  if (secret) {
    const eyeSpan = document.createElement("span");
    eyeSpan.classList.add("input-group-append");

    const eyeBtn = document.createElement("button");
    eyeBtn.classList.add("btn", "btn-light");
    eyeBtn.type = "button";
    eyeBtn.dataset.service = serviceId;
    eyeBtn.dataset.row = rowId;
    eyeBtn.dataset.element = elementId;
    eyeBtn.id = `${idPrefix}-${elementId}-view-password`;

    const eyeIcon = document.createElement("i");
    eyeIcon.id = `${idPrefix}-${elementId}-password-eye`;
    eyeIcon.classList.add("fa", "fa-eye");
    eyeIcon.setAttribute("aria-hidden", "true");

    eyeBtn.appendChild(eyeIcon);
    eyeSpan.appendChild(eyeBtn);
    inputGroup.appendChild(eyeSpan);
  } else if (copy) {
    const copyBtn = document.createElement("button");
    copyBtn.id = `${idPrefix}-text-copybutton`;
    copyBtn.dataset.service = serviceId;
    copyBtn.dataset.row = rowId;
    copyBtn.dataset.copyKey = elementId;
    copyBtn.type = "button";
    copyBtn.className = "absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-white rounded-md border border-gray-300 hover:bg-gray-100 active:bg-gray-200";
    copyBtn.setAttribute("data-bs-toggle", "tooltip");
    copyBtn.setAttribute("data-bs-placement", "top");
    copyBtn.setAttribute("title", "Copy to clipboard");
    copyBtn.innerHTML = getSvg("copy");  // assumes `getSvg("copy")` returns the SVG HTML string

    inputGroup.appendChild(copyBtn);
  }

  const invalidDiv = document.createElement("div");
  invalidDiv.classList.add("invalid-feedback");
  invalidDiv.innerText = elementOptions?.input?.options?.warning || "";

  if (secret || copy) {
    inputCol.appendChild(inputGroup);
  } else {
    inputCol.appendChild(input);
  }

  inputCol.appendChild(invalidDiv);
  wrapper.appendChild(inputCol);

  return wrapper.outerHTML.trim();
}



function tcCreateStorageEntryInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions = {}) {
  const container = document.createElement("div");

  // Paragraph with button
  const p = document.createElement("p");
  p.style.justifySelf = "center";
  p.innerText = "Add Storage Mount";

  const addBtn = document.createElement("button");
  addBtn.classList.add("btn", "btn-success", "add-data-mount");
  addBtn.id = `${idPrefix}-addbtn-input`;
  addBtn.dataset.btnType = "add";
  addBtn.dataset.service = serviceId;
  addBtn.dataset.row = rowId;
  addBtn.dataset.tab = tabId;
  addBtn.dataset.element = elementId;
  addBtn.dataset.collect = "false";
  addBtn.type = "button";
  addBtn.style.marginLeft = "8px";
  addBtn.innerHTML = getSvg("plus");  // assumes getSvg("plus") returns your SVG markup

  p.appendChild(addBtn);
  container.appendChild(p);

  // Table
  const table = document.createElement("table");
  table.id = `${serviceId}-${rowId}-${tabId}-table`;
  table.style.display = "none";
  table.style.justifySelf = "center";
  table.className = "table table-bordered table-striped table-hover table-light align-middle";

  const thead = document.createElement("thead");
  thead.className = "table-secondary";
  thead.style.width = "50%";

  const tr = document.createElement("tr");

  const th1 = document.createElement("th");
  th1.scope = "col";
  th1.style.width = "5%";

  const th2 = document.createElement("th");
  th2.scope = "col";
  th2.style.width = "85%";
  th2.innerText = "Template";

  const th3 = document.createElement("th");
  th3.scope = "col";
  th3.style.width = "10%";
  th3.className = "text-center";
  th3.innerText = "Action";

  tr.append(th1, th2, th3);
  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  container.appendChild(table);
  return container.outerHTML.trim();
}


function tcCreateTextGrowerInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions = {}) {
  const container = document.createElement("div");
  container.id = `${idPrefix}-${elementId}-input-div`;
  container.className = "row mb-1";

  // Add element parameters as attributes
  const elementParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(elementParams)) {
    if (value === true) {
      container.setAttribute(key, "");
    } else if (value !== false && value != null) {
      container.setAttribute(key, value);
    }
  }

  const label = tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
  container.appendChild(htmlToElement(label));

  // Inner div container
  const innerDiv = document.createElement("div");
  innerDiv.className = `container col-${12 - (parseInt(elementOptions.label?.width ?? "4", 10))} d-flex flex-column justify-content-center`;
  innerDiv.dataset.count = "1";

  // Input group div
  const inputGroup = document.createElement("div");
  inputGroup.className = "input-group";
  inputGroup.style.display = "flex";
  inputGroup.style.alignItems = "center";
  inputGroup.style.marginBottom = "10px";

  // Input element
  const input = document.createElement("input");
  input.id = `${idPrefix}-1-${elementId}-input`;
  input.type = (elementOptions.input?.options?.secret) ? "password" : "text";
  input.className = "form-control";

  // Add element parameters for the input itself
  const inputParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions);
  for (const [key, value] of Object.entries(inputParams)) {
    if (value === true) {
      input.setAttribute(key, "");
    } else if (value !== false && value != null) {
      input.setAttribute(key, value);
    }
  }

  input.name = elementOptions.input?.options?.name ?? elementId;

  // Add input to inputGroup
  inputGroup.appendChild(input);

  // Button element
  const btn = document.createElement("button");
  btn.dataset.service = serviceId;
  btn.dataset.row = rowId;
  btn.dataset.tab = tabId;
  btn.dataset.collectStatic = ""; // data-collect-static attribute, empty string for boolean
  btn.dataset.element = elementId;
  btn.dataset.textgrowerBtnType = "add";
  btn.dataset.collect = "false";
  btn.type = "button";
  btn.id = `${idPrefix}-1-addbtn-${elementId}-input`;
  btn.dataset.btnType = "add";
  btn.style.marginLeft = "8px";
  btn.className = "btn btn-primary";

  if (elementOptions.input?.options?.enabled === false) {
    btn.disabled = true;
  }

  // Assuming you have a function getSvg("plus") for the SVG icon
  btn.innerHTML = getSvg("plus");

  inputGroup.appendChild(btn);
  innerDiv.appendChild(inputGroup);

  // Invalid feedback div
  const invalidFeedback = document.createElement("div");
  invalidFeedback.className = "invalid-feedback";
  invalidFeedback.textContent = elementOptions.input?.options?.warning || "";
  innerDiv.appendChild(invalidFeedback);

  container.appendChild(innerDiv);

  return container.outerHTML.trim();
}


function tcCreateDateInput(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {},
  today = new Date(),
  todayPlusHalfYear = new Date(new Date().setMonth(today.getMonth() + 6)),
  todayPlusOneYear = new Date(new Date().setFullYear(today.getFullYear() + 1))
) {
  // Format dates to yyyy-mm-dd for input[type=date] value, min, max
  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  const container = document.createElement("div");
  container.id = `${idPrefix}-${elementId}-input-div`;
  container.className = "row mb-1";

  const elementParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(elementParams)) {
    if (value === true) container.setAttribute(key, "");
    else if (value !== false && value != null) container.setAttribute(key, value);
  }

  // Append label created by your existing tcCreateLabel
  const label = tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
  container.appendChild(htmlToElement(label));

  // Inner div with col width
  const labelWidth = parseInt(elementOptions.label?.width ?? "4", 10);
  const innerDiv = document.createElement("div");
  innerDiv.className = `col-${12 - labelWidth} d-flex flex-column justify-content-center`;

  // Input element type=date
  const input = document.createElement("input");
  input.type = "date";
  input.className = "form-control";

  // Add parameters to input element
  const inputParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions);
  for (const [key, value] of Object.entries(inputParams)) {
    if (value === true) input.setAttribute(key, "");
    else if (value !== false && value != null) input.setAttribute(key, value);
  }

  input.name = elementOptions.input?.options?.name ?? elementId;
  input.id = `${idPrefix}-${elementId}-input`;

  // Set value, min, max attributes
  input.value = formatDate(todayPlusHalfYear);
  input.min = formatDate(today);
  input.max = formatDate(todayPlusOneYear);

  innerDiv.appendChild(input);

  // Invalid feedback div
  const invalidFeedback = document.createElement("div");
  invalidFeedback.className = "invalid-feedback";
  invalidFeedback.textContent = elementOptions.input?.options?.warning || "";
  innerDiv.appendChild(invalidFeedback);

  container.appendChild(innerDiv);

  return container.outerHTML.trim();
}


function tcCreateNumberInput(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {}
) {
  // Get the 'name' attribute or default to elementId
  const nameAttr = elementOptions.input?.options?.name ?? elementId;

  // Create main container div
  const container = document.createElement("div");
  container.id = `${idPrefix}-${elementId}-input-div`;
  container.className = "row mb-2";

  // Apply container parameters with define_show = true
  const containerParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(containerParams)) {
    if (value === true) container.setAttribute(key, "");
    else if (value != null && value !== false) container.setAttribute(key, value);
  }

  // Append label created by your existing tcCreateLabel function
  const label = tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
  container.appendChild(htmlToElement(label));

  // Inner div with dynamic col size
  const labelWidth = parseInt(elementOptions.label?.width ?? "4", 10);
  const innerDiv = document.createElement("div");
  innerDiv.className = `col-${12 - labelWidth} d-flex flex-column justify-content-center`;

  // Create input[type=number]
  const input = document.createElement("input");
  input.type = "number";
  input.name = nameAttr;
  input.className = "form-control";
  input.id = `${idPrefix}-${elementId}-input`;

  // Apply element parameters without define_show
  const inputParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions);
  for (const [key, value] of Object.entries(inputParams)) {
    if (value === true) input.setAttribute(key, "");
    else if (value != null && value !== false) input.setAttribute(key, value);
  }

  // Set optional attributes based on elementOptions.input.options
  const inputOpts = elementOptions.input?.options ?? {};
  if (inputOpts.required) input.required = true;
  if (inputOpts.pattern) input.pattern = inputOpts.pattern;
  if (inputOpts.placeholder) input.placeholder = inputOpts.placeholder;
  if (inputOpts.value !== undefined && inputOpts.value !== null && inputOpts.value !== "") {
    input.value = inputOpts.value;
  }
  if (inputOpts.enabled === false) input.disabled = true;

  innerDiv.appendChild(input);

  // Add invalid-feedback div
  const invalidFeedback = document.createElement("div");
  invalidFeedback.className = "invalid-feedback";
  invalidFeedback.textContent = inputOpts.warning || "";
  innerDiv.appendChild(invalidFeedback);

  container.appendChild(innerDiv);

  return container.outerHTML.trim();
}

function tcCreateCheckboxInput(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {}
) {
  const inputOpts = elementOptions.input?.options || {};
  const nameAttr = inputOpts.name ?? elementId;
  const labelWidth = parseInt(elementOptions.label?.width ?? "4", 10);

  // Container div
  const container = document.createElement("div");
  container.id = `${idPrefix}-${elementId}-input-div`;
  container.className = "row mb-2";

  // Add element parameters with define_show = true
  const containerParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(containerParams)) {
    if (value === true) container.setAttribute(key, "");
    else if (value != null && value !== false) container.setAttribute(key, value);
  }

  // Append label created with tcCreateLabel
  const label = tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
  container.appendChild(htmlToElement(label));

  // Inner div with dynamic col size
  const innerDiv = document.createElement("div");
  innerDiv.className = `col-${12 - labelWidth} d-flex flex-column justify-content-center`;

  // Create checkbox input
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = nameAttr;
  input.className = "form-check-input";
  input.id = `${idPrefix}-${elementId}-input`;

  // Add element parameters without define_show
  const inputParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions);
  for (const [key, value] of Object.entries(inputParams)) {
    if (value === true) input.setAttribute(key, "");
    else if (value != null && value !== false) input.setAttribute(key, value);
  }

  if (inputOpts.required) input.required = true;
  if (inputOpts.pattern) input.pattern = inputOpts.pattern;
  if (inputOpts.placeholder) input.placeholder = inputOpts.placeholder;
  if (inputOpts.value !== undefined && inputOpts.value !== null && inputOpts.value !== "") {
    input.value = inputOpts.value;
  }
  if (inputOpts.enabled === false) input.disabled = true;
  if (inputOpts.default === true) input.checked = true;

  innerDiv.appendChild(input);

  // Invalid feedback div
  const invalidFeedback = document.createElement("div");
  invalidFeedback.className = "invalid-feedback";
  invalidFeedback.textContent = inputOpts.warning || "";
  innerDiv.appendChild(invalidFeedback);

  container.appendChild(innerDiv);

  return container.outerHTML.trim();
}

function tcCreateSelectInput(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {}
) {
  const inputOpts = elementOptions.input?.options || {};
  const values = elementOptions.input?.values || {};
  const nameAttr = inputOpts.name ?? elementId;
  const labelWidth = parseInt(elementOptions.label?.width ?? "4", 10);
  // Container div
  const container = document.createElement("div");
  container.id = `${idPrefix}-${elementId}-input-div`;
  container.className = "row mb-1";

  // Add element parameters with define_show = true
  const containerParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(containerParams)) {
    if (value === true) container.setAttribute(key, "");
    else if (value != null && value !== false) container.setAttribute(key, value);
  }

  // Append label created with tcCreateLabel
  const label = tcCreateLabel(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
  container.appendChild(htmlToElement(label));

  // Inner div with dynamic col size
  const innerDiv = document.createElement("div");
  innerDiv.className = `col-${12 - labelWidth} d-flex flex-column justify-content-center`;

  // Create select element
  const select = document.createElement("select");
  select.name = nameAttr;
  select.id = `${idPrefix}-${elementId}-input`;
  select.className = "form-select";
  if ( inputOpts?.credits === true ) {
    select.setAttribute("data-sse-credits", "");
    select.setAttribute("data-sse-credits-key", `${elementId}`);
  }

  // Add element parameters without define_show
  const selectParams = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions);
  for (const [key, value] of Object.entries(selectParams)) {
    if (value === true) select.setAttribute(key, "");
    else if (value != null && value !== false) select.setAttribute(key, value);
  }

  // Add options to select
  for (const [key, value] of Object.entries(values)) {
    const option = document.createElement("option");
    option.value = key;

    option.textContent = value;
    select.appendChild(option);
  }

  innerDiv.appendChild(select);

  // Invalid feedback div
  const invalidFeedback = document.createElement("div");
  invalidFeedback.className = "invalid-feedback";
  invalidFeedback.textContent = inputOpts.warning || "You have to select at least one item.";
  innerDiv.appendChild(invalidFeedback);

  container.appendChild(innerDiv);

  return container.outerHTML.trim();
}

function tcCreateReservationInfo(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {}
) {
  // Container div
  const container = document.createElement("div");
  container.id = `${idPrefix}-${elementId}-input-div`;
  container.className = "row mb-3";

  // Apply element parameters with define_show = true
  const params = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(params)) {
    if (value === true) container.setAttribute(key, "");
    else if (value != null && value !== false) container.setAttribute(key, value);
  }

  // The info div with offset and column sizing
  const infoDiv = document.createElement("div");
  infoDiv.id = `${idPrefix}-${elementId}-info`;
  infoDiv.className = "col-8 offset-4";

  // CSS class for label spans
  const labelClass = "col-4 fw-bold";

  // Helper to create row with label and value span
  function createInfoRow(labelText, spanIdSuffix) {
    const row = document.createElement("div");
    row.className = "row";

    const labelSpan = document.createElement("span");
    labelSpan.className = labelClass;
    labelSpan.textContent = labelText;
    row.appendChild(labelSpan);

    const valueSpan = document.createElement("span");
    valueSpan.id = `${idPrefix}-${elementId}-${spanIdSuffix}`;
    valueSpan.className = "col-auto";
    row.appendChild(valueSpan);

    return row;
  }

  // Append rows for Start Time, End Time, and State
  infoDiv.appendChild(createInfoRow("Start Time:", "start"));
  infoDiv.appendChild(createInfoRow("End Time:", "end"));
  infoDiv.appendChild(createInfoRow("State:", "state"));

  // Details block
  const detailsWrapper = document.createElement("div");
  detailsWrapper.className = "mt-1";

  const details = document.createElement("details");

  const summary = document.createElement("summary");
  summary.className = "fw-bold";
  summary.textContent = "Detailed reservation information:";

  const pre = document.createElement("pre");
  pre.id = `${idPrefix}-${elementId}-details`;

  details.appendChild(summary);
  details.appendChild(pre);
  detailsWrapper.appendChild(details);

  infoDiv.appendChild(detailsWrapper);
  container.appendChild(infoDiv);

  return container.outerHTML.trim();
}

function tcCreateFlavorLegend(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {}
) {
  const container = document.createElement("div");
  container.id = `${idPrefix}-${elementId}-input-div`;
  container.className = "row align-items-center g-0 mt-4";

  // Apply element parameters with define_show = true
  const params = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(params)) {
    if (value === true) container.setAttribute(key, "");
    else if (value != null && value !== false) container.setAttribute(key, value);
  }

  // Span for the title
  const titleSpan = document.createElement("span");
  titleSpan.className = "col-4 fw-bold";
  titleSpan.textContent = "Available Flavors";
  container.appendChild(titleSpan);

  // The div containing boxes and labels
  const legendDiv = document.createElement("div");
  legendDiv.className = "col d-flex align-items-center ms-2";

  const boxStyle = "height: 15px; width: 15px; border-radius: 0.25rem;";

  // Helper to create colored box + label
  function createBoxLabel(color, labelText) {
    const box = document.createElement("div");
    box.style.cssText = `${boxStyle} background-color: ${color};`;
    legendDiv.appendChild(box);

    const label = document.createElement("span");
    label.className = "ms-1";
    label.textContent = `= ${labelText}`;
    legendDiv.appendChild(label);

    const spacer = document.createElement("span");
    spacer.className = "mx-2";
    legendDiv.appendChild(spacer);
  }

  createBoxLabel("#198754", "Free");
  createBoxLabel("#023d6b", "Used");
  createBoxLabel("#dc3545", "Limit exceeded");

  container.appendChild(legendDiv);

  return container.outerHTML.trim();
}

function tcCreateFlavorInfo(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {}
) {
  const div = document.createElement("div");
  div.id = `${idPrefix}-${elementId}-input-div`;
  div.className = "mb-3";
  div.setAttribute("data-sse-flavors", "");

  // Apply element parameters with define_show = true
  const params = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(params)) {
    if (value === true) div.setAttribute(key, "");
    else if (value != null && value !== false) div.setAttribute(key, value);
  }

  return div.outerHTML.trim();
}

function tcCreateSelectHelper(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {}
) {
  // Create container div with id, classes, and attributes
  const container = document.createElement("div");
  container.id = `${idPrefix}-${elementId}-input-div`;
  container.className = "row g-0";
  // Set element parameters with define_show = true
  const params = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions, { define_show: true });
  for (const [key, value] of Object.entries(params)) {
    if (value === true) container.setAttribute(key, "");
    else if (value !== false && value != null) container.setAttribute(key, value);
  }

  // Helper function to create a checkbox with label
  function createCheckbox(labelText, suffix) {
    const colDiv = document.createElement("div");
    colDiv.className = "form-check col-sm-6 col-md-4 col-lg-3";

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "form-check-input module-selector";
    checkbox.dataset.service = serviceId;
    checkbox.dataset.row = rowId;
    checkbox.dataset.tab = tabId;
    checkbox.id = `${idPrefix}-${elementId}-${suffix}-input`;

    const label = document.createElement("label");
    label.className = "form-check-label";
    label.htmlFor = checkbox.id;
    label.textContent = labelText;

    colDiv.appendChild(checkbox);
    colDiv.appendChild(label);

    return colDiv;
  }

  // Add "Select all" checkbox
  container.appendChild(createCheckbox("Select all", "select-all"));

  // Add "Deselect all" checkbox
  container.appendChild(createCheckbox("Deselect all", "select-none"));

  return '<hr>' + container.outerHTML.trim();
}

function tcCreateLogContainer(
  idPrefix,
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {}
) {
  // Outer container div for the terminal container
  const outerDiv = document.createElement("div");
  outerDiv.id = `${idPrefix}-terminal-container-div`;
  // Optional: outerDiv.style.display = "none"; // Uncomment if you want it hidden initially

  // Flex container div for centering the terminal container
  const flexDiv = document.createElement("div");
  flexDiv.id = `${idPrefix}-terminal-container-flex`;
  flexDiv.style.display = "flex";
  flexDiv.style.justifyContent = "center";
  flexDiv.style.alignItems = "center";
  flexDiv.style.marginBottom = "10px";

  // Terminal container div (black background, scrollable)
  const terminalDiv = document.createElement("div");
  terminalDiv.id = `${idPrefix}-terminal-container`;
  terminalDiv.style.width = "60%";
  terminalDiv.style.maxHeight = "50%";
  terminalDiv.style.backgroundColor = "black";
  terminalDiv.style.overflow = "auto";

  flexDiv.appendChild(terminalDiv);
  outerDiv.appendChild(flexDiv);

  // Card container for logs text
  const cardDiv = document.createElement("div");
  cardDiv.id = `${idPrefix}-${elementId}-input`;
  cardDiv.className = "card card-body text-black row g-0";

  // Apply element parameters attributes
  const params = tcElementParameters(serviceId, rowId, tabId, elementId, elementOptions);
  for (const [key, value] of Object.entries(params)) {
    if (value === true) cardDiv.setAttribute(key, "");
    else if (value !== false && value != null) cardDiv.setAttribute(key, value);
  }

  // Inner log text div
  const logDiv = document.createElement("div");
  logDiv.className = "log-div";
  logDiv.textContent = "Logs collected during the Start process will be shown here.";

  cardDiv.appendChild(logDiv);

  return outerDiv.outerHTML + cardDiv.outerHTML ;
}

const createdElements = {}

function tcCreateElement(
  serviceId,
  rowId,
  tabId,
  elementId,
  elementOptions = {},
  isFirstRow = false
) {
  const idPrefix = `${serviceId}-${rowId}-${tabId}`;
  const type = elementOptions.input?.type || "";
  // console.log(`Create Element ${idPrefix}-${elementId}`);
  let element = '';

  const allOptions = getFrontendConfig().services.options[serviceId].tabs;

  // add elementId to createdElements before to avoid inifinite recursion
  // if (!createdElements[serviceId]) {
  //   createdElements[serviceId] = {};
  // }
  // if (!Array.isArray(createdElements[serviceId][rowId])) {
  //   createdElements[serviceId][rowId] = [];
  // }
  // if (!createdElements[serviceId][rowId].includes(elementId)) {
  //   createdElements[serviceId][rowId].push(elementId);
  // } else {
  //   return ``;
  // }
  // for (const key of Object.keys(elementOptions?.trigger ?? {})) {
  //   // create elements first that might trigger an update for this element
  //   if ( key === "init" ) continue;
  //   if (createdElements[serviceId][rowId].includes(key)) continue;    
  //   for (const any1Key of Object.keys(allOptions)) {
  //     const any2Group = allOptions[any1Key];
  //     for (const any2Key of Object.keys(any2Group)) {
  //       const subDict = any2Group[any2Key];
  //       if (key in subDict) {
  //         depsOptions = subDict[key];
  //         // console.log(`${rowId} - Create dependency element "${key}" first.`);
  //         console.log(`Create ${key} before creating ${elementId}`);
  //         element += tcCreateElement(serviceId, rowId, any1Key, key, depsOptions);
  //       }
  //     }
  //   }
  // }
  
  switch (type) {
    case "text":
      element += tcCreateTextInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "storageentry":
      element += tcCreateStorageEntryInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "textgrower":
      element += tcCreateTextGrowerInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "label":
      element += tcCreateLabelInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "date":
      element += tcCreateDateInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "number":
      element += tcCreateNumberInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "checkbox":
      element += tcCreateCheckboxInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "buttons":
      element += tcCreateButtons(serviceId, rowId, elementOptions, isFirstRow);
      break;
    case "select":
      element += tcCreateSelectInput(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "reservationinfo":
      element += tcCreateReservationInfo(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "flavorlegend":
      element += tcCreateFlavorLegend(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "flavorinfo":
      element += tcCreateFlavorInfo(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "multiple_checkboxes":
      element += tcCreateMultipleCheckboxes(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "selecthelper":
      element += tcCreateSelectHelper(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "logcontainer":
      element += tcCreateLogContainer(idPrefix, serviceId, rowId, tabId, elementId, elementOptions);
      break;
    case "hr":
      element += `<hr>`;
      break;
    default:
      // fallback: return empty fragment or null
      element += ``;
  }
  return element;
}

function tcRowContent(serviceId, serviceOptions, rowId, tabId, isFirstRow = false) {
  let ret = ``;

  const tab = serviceOptions?.tabs?.[tabId] || {};
  const tabLength = Object.keys(tab).length;
  const colSize = tabLength > 0 ? Math.floor(12 / tabLength) : 12;

  for ( const anyKey in tab ) {
    const container = document.createElement("div");
    container.classList.add(`col-${colSize}`);
    const centerElements = serviceOptions?.tabs?.[tabId]?.[anyKey] || {};
    
    for (const [elementId, elementOptions] of Object.entries(centerElements)) {
      const element = tcCreateElement(serviceId, rowId, tabId, elementId, elementOptions, isFirstRow);
      if ( typeof(element) === "string" ) {
        container.appendChild(htmlToElement(element));
      } else {
        container.appendChild(element);
      }
    }
    ret += container.outerHTML.trim();
  }
  return ret;
}


// Workshop Manager description block
function tcWorkshopManagerDescription() {
  const container = document.createElement('div');

  const h2 = document.createElement('h2');
  h2.textContent = 'Workshop Manager';

  const p1 = document.createElement('p');
  p1.textContent = 'Select the options users might be able to use during your workshop.';

  const p2 = document.createElement('p');
  p2.innerHTML = `Use shift or ctrl to select multiple items. <a style="color:#fff" href="https://jupyterjsc.pages.jsc.fz-juelich.de/docs/jupyterjsc/" target="_">Click here for more information.</a>`;

  container.append(h2, p1, p2);
  return container;
}

// Workshop Manager header layout (table headers)
function tcWorkshopManagerHeaderLayout() {
  const fragment = document.createDocumentFragment();

  const thEmpty = document.createElement('th');
  thEmpty.scope = 'col';
  thEmpty.style.width = '1%';
  fragment.appendChild(thEmpty);

  const thName = document.createElement('th');
  thName.scope = 'col';
  thName.style.width = '20%';
  thName.textContent = 'Name';
  fragment.appendChild(thName);

  const thDescription = document.createElement('th');
  thDescription.scope = 'col';
  thDescription.textContent = 'Description';
  fragment.appendChild(thDescription);

  const thAction = document.createElement('th');
  thAction.scope = 'col';
  thAction.classList.add('text-center');
  thAction.style.width = '10%';
  thAction.textContent = 'Action';
  fragment.appendChild(thAction);

  return fragment;
}

// Workshop Manager default header row
function tcWorkshopManagerDefaultHeader(serviceId, rowId, rowOptions, serviceOptions) {
  const tr = document.createElement('tr');

  // Name cell
  const thName = document.createElement('th');
  thName.scope = 'row';
  thName.classList.add('name-td');
  thName.textContent = rowId;
  tr.appendChild(thName);

  // Description cell
  const thDesc = document.createElement('th');
  thDesc.scope = 'row';
  thDesc.classList.add('description-td', 'text-center');
  thDesc.textContent = rowOptions?.user_options?.description || '';
  tr.appendChild(thDesc);

  // Action cell
  const thAction = document.createElement('th');
  thAction.scope = 'row';
  thAction.classList.add('url-td', 'text-center');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = `${serviceId}-${rowId}-open-btn-header`;
  btn.classList.add('btn', 'btn-success', 'open-workshop-btn');
  btn.setAttribute('data-row', rowId);
  btn.setAttribute('data-target', `#${rowId}-workshop-link`);

  // Insert svg icon + text, assume svgOpenIcon is a string with SVG markup
  btn.innerHTML = `${getSvg("open")} Open`;

  thAction.appendChild(btn);
  tr.appendChild(thAction);

  return tr.innerHTML;
}


// Creates the "New Workshop" header row with a Create button
function tcWorkshopManagerFirstHeader(serviceId, rowId, rowOptions, serviceOptions) {
  const tr = document.createElement('tr');

  // Name cell
  const thName = document.createElement('th');
  thName.scope = 'row';
  thName.classList.add('name-td');
  thName.textContent = 'New Workshop';
  tr.appendChild(thName);

  // Description cell
  const thDesc = document.createElement('th');
  thDesc.scope = 'row';
  thDesc.classList.add('description-td', 'text-center');
  thDesc.textContent = 'Design a simplified set of options for your workshop to make it more accessible for your students.';
  tr.appendChild(thDesc);

  // Action cell with Create button
  const thAction = document.createElement('th');
  thAction.scope = 'row';
  thAction.classList.add('url-td', 'text-center');

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.dataset.service = serviceId;
  btn.dataset.row = rowId;
  btn.id = `${serviceId}-${rowId}-new-btn-header`;
  btn.classList.add('btn', 'btn-primary');
  btn.setAttribute('data-target', `#${rowId}-workshop-link`);
  btn.innerHTML = `${getSvg("plus")} Create`;

  thAction.appendChild(btn);
  tr.appendChild(thAction);

  return tr.innerHTML;
}

// Creates row content with two columns, each column containing elements
// Assumes table_elements.create_element() is available and returns a DOM element
function tcWorkshopManagerRowContent(serviceId, serviceOptions, rowId, tabId, tableElements) {
  const container = document.createElement('div');
  container.classList.add('row');

  const tabs = serviceOptions?.tabs?.[tabId] || {};
  // For each side (e.g., 'left', 'right' or 'center', etc.)
  Object.keys(tabs).forEach(side => {
    const colDiv = document.createElement('div');
    colDiv.classList.add('col-6');

    const elements = tabs[side] || {};
    Object.entries(elements).forEach(([elementId, elementOptions]) => {
      // create_element should return a DOM node
      const elementNode = tableElements.create_element(serviceId, rowId, tabId, elementId, elementOptions);
      if (elementNode) {
        colDiv.appendChild(elementNode);
      }
    });

    container.appendChild(colDiv);
  });

  return container;
}

function tcWorkshopHeaderLayout() {
  const fragment = document.createDocumentFragment();

  const thEmpty = document.createElement('th');
  thEmpty.scope = 'col';
  thEmpty.style.width = '1%';
  fragment.appendChild(thEmpty);

  const thName = document.createElement('th');
  thName.scope = 'col';
  thName.style.width = '20%';
  thName.textContent = 'Name';
  fragment.appendChild(thName);

  const thDescription = document.createElement('th');
  thDescription.scope = 'col';
  thDescription.textContent = 'Description';
  fragment.appendChild(thDescription);

  const thStatus = document.createElement('th');
  thStatus.scope = 'col';
  thStatus.classList.add('text-center');
  thStatus.style.width = '10%';
  thStatus.textContent = 'Status';
  fragment.appendChild(thStatus);

  const thAction = document.createElement('th');
  thAction.scope = 'col';
  thAction.classList.add('text-center');
  thAction.style.width = '10%';
  thAction.textContent = 'Action';
  fragment.appendChild(thAction);

  return fragment;
}

function tcWorkshopDefaultHeader(serviceId, rowId, workshopOptions) {
  const spawner = getSpawner();
  const tr = document.createElement('tr');

  // Button visibility based on spawner states
  const active = Boolean(spawner.active);
  const ready = Boolean(spawner.ready);

  // Name cell
  const thName = document.createElement('th');
  thName.scope = 'row';
  thName.classList.add('name-td');
  thName.textContent = `Workshop ${workshopOptions?.workshopid || ''}`;
  tr.appendChild(thName);

  // Description cell
  const thDesc = document.createElement('th');
  thDesc.scope = 'row';
  thDesc.classList.add('description-td', 'text-center');
  thDesc.textContent = workshopOptions?.description || '';
  tr.appendChild(thDesc);

  // Status cell with progress bar container (hidden by default)
  const thStatus = document.createElement('th');
  thStatus.scope = 'row';
  thStatus.classList.add('status-td');

  const statusDiv = document.createElement('div');
  statusDiv.classList.add('d-flex', 'justify-content-center');

  const progressParent = document.createElement('div');
  progressParent.id = `${serviceId}-${rowId}-progress-bar-parent`;
  if ( !ready ) progressParent.style.display = 'none';

  const progressFlexCol = document.createElement('div');
  progressFlexCol.classList.add('d-flex', 'flex-column');

  // Progress bar container
  const progressBarWrapper = document.createElement('div');
  progressBarWrapper.classList.add('d-flex', 'justify-content-center', 'progress');
  progressBarWrapper.style.backgroundColor = '#d3e4f4';
  progressBarWrapper.style.height = '20px';
  progressBarWrapper.style.minWidth = '100px';
  // progressBarWrapper.style.position = 'relative';

  const progressBar = document.createElement('div');
  progressBar.id = `${serviceId}-${rowId}-progress-bar`;
  progressBar.dataset.service = serviceId;
  progressBar.dataset.row = rowId;
  progressBar.classList.add('progress-bar', 'progress-bar-striped', 'progress-bar-animated');
  if ( ready ) progressBar.classList.add('bg-success');
  progressBar.setAttribute('role', 'progressbar');
  if ( ready ) {
    progressBar.style.width = '100px';
  } else {
    progressBar.style.width = '0px';
  }
  progressBar.style.marginRight = 'auto';

  const progressText = document.createElement('span');
  progressText.id = `${serviceId}-${rowId}-progress-text`;
  progressText.style.position = 'absolute';
  progressText.style.width = '100px';
  progressText.style.textAlign = 'center';
  progressText.style.lineHeight = '20px';
  progressText.style.color = 'black';

  progressBarWrapper.appendChild(progressBar);
  progressBarWrapper.appendChild(progressText);

  const progressInfoText = document.createElement('span');
  progressInfoText.id = `${serviceId}-${rowId}-progress-info-text`;
  progressInfoText.classList.add('progress-info-text', 'text-center', 'text-muted');
  progressInfoText.style.fontSize = 'smaller';
  if ( ready ) progressInfoText.innerHTML = "running";

  progressFlexCol.appendChild(progressBarWrapper);
  progressFlexCol.appendChild(progressInfoText);

  progressParent.appendChild(progressFlexCol);
  statusDiv.appendChild(progressParent);
  thStatus.appendChild(statusDiv);
  tr.appendChild(thStatus);

  // Action buttons cell
  const thAction = document.createElement('th');
  thAction.scope = 'row';
  thAction.classList.add('url-td', 'text-center');
  thAction.style.whiteSpace = 'nowrap';

  // Helper to create buttons
  function createButton(idSuffix, btnClass, dataElement, isVisible, svgIcon, text) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = `${serviceId}-${rowId}-${idSuffix}-btn-header`;
    btn.classList.add('btn', btnClass);
    btn.dataset.service = serviceId;
    btn.dataset.row = rowId;
    btn.dataset.element = dataElement;
    if (!isVisible) btn.style.display = 'none';
    btn.style.marginRight = "3px";
    btn.innerHTML = `${svgIcon} ${text}`;
    return btn;
  }


  // Open button (show if active)
  thAction.appendChild(createButton('open', 'btn-success', 'open', active, getSvg("open"), 'Open'));
  // Stop button (show if ready)
  thAction.appendChild(createButton('stop', 'btn-danger', 'stop', ready, getSvg("stop"), 'Stop'));
  // Cancel button (show if NOT ready AND active)
  thAction.appendChild(createButton('cancel', 'btn-danger', 'cancel', !ready && active, getSvg("stop"), 'Cancel'));
  // Start button (show if NOT active)
  thAction.appendChild(createButton('start', 'btn-primary', 'start', !active, getSvg("start"), 'Start'));

  tr.appendChild(thAction);

  return tr.innerHTML;
}

function tcWorkshopDescription() {
  return document.createDocumentFragment(); // empty fragment
}

function tcHomeDescription() {
  const p = document.createElement('p');
  p.textContent = 'You can configure your existing JupyterLabs by expanding the corresponding table row.';
  return p;
}

function tcSpawnDescription() {
  const fragment = document.createDocumentFragment();

  const h2 = document.createElement('h2');
  h2.textContent = 'Your server is starting up.';
  fragment.appendChild(h2);

  const p1 = document.createElement('p');
  p1.textContent = 'You will be redirected automatically when it\'s ready for you.';
  fragment.appendChild(p1);

  const p2 = document.createElement('p');
  // Create a styled link inside p2
  const link = document.createElement('a');
  link.href = '/hub/home';
  link.style.color = 'white';
  link.style.fontWeight = 'bold';
  link.textContent = 'configuration page';
  p2.appendChild(document.createTextNode('If you want to update your configuration or create a new one, please go to the '));
  p2.appendChild(link);
  p2.appendChild(document.createTextNode('.'));
  fragment.appendChild(p2);

  return fragment;
}

function tcHomeHeaderLayout() {
  const tr = document.createElement('tr');

  const thEmpty = document.createElement('th');
  thEmpty.scope = 'col';
  thEmpty.style.width = '1%';
  tr.appendChild(thEmpty);

  const thName = document.createElement('th');
  thName.scope = 'col';
  thName.style.width = '20%';
  thName.textContent = 'Name';
  tr.appendChild(thName);

  const thConfig = document.createElement('th');
  thConfig.scope = 'col';
  thConfig.textContent = 'Configuration';
  tr.appendChild(thConfig);

  const thStatus = document.createElement('th');
  thStatus.scope = 'col';
  thStatus.classList.add('text-center');
  thStatus.style.width = '10%';
  thStatus.textContent = 'Status';
  tr.appendChild(thStatus);

  const thAction = document.createElement('th');
  thAction.scope = 'col';
  thAction.classList.add('text-center');
  thAction.style.width = '10%';
  thAction.textContent = 'Action';
  tr.appendChild(thAction);

  return tr;
}

function tcHomeFirstHeader(...args) {
  const th = document.createElement('th');
  th.scope = 'row';
  th.colSpan = 100; // covers all columns
  th.classList.add('text-center');
  th.textContent = 'New JupyterLab';
  return th.outerHTML;
}

function homeDefaultHeaderTypeNormal(spawner, service_id, row_id, row_options, service_options) {
  // Determine progress
  let progress = 0;
  const ready = !!spawner.ready;
  const active = !!spawner.active;
  const failed = !!spawner.failed;
  const events = Array.isArray(spawner.events) ? spawner.events : [];
  const lastEvent = events.length ? events[events.length - 1] : null;

  if (ready) {
    progress = 100;
  } else if (active) {
    if (lastEvent && typeof lastEvent === 'object') {
      progress = Number(lastEvent.progress) || 0;
    }
  } else if (spawner.events) {
    progress = 0;
  }

  // Defaults and options from service_options and spawner.user_options
  const defaultOption = service_options?.default?.options?.option ?? false;
  const option = spawner.user_options?.option ?? defaultOption;

  const defaultSystem = service_options?.default?.options?.system ?? false;
  const system = spawner.user_options?.system ?? defaultSystem;
  

  // Mapping for repotype
  const repotypeMapping = {
    "gh": "GitHub",
    "git": "Git repository",
    "gl": "GitLab",
    "gist": "GitHub Gist",
    "zenodo": "Zenodo DOI",
    "figshare": "FigShare DOI",
    "hydroshare": "Hydroshare resource",
    "dataverse": "Dataverse DOI",
    "ckan": "CKAN dataset"
  };

  // Helper to create styled span with label and value
  function createConfigItem(service_id, row_id, idPrefix, label, value, show = true, columnswidth = 3) {
    const container = document.createElement('div');
    container.className = `col text-lg-center col-12 col-lg-${columnswidth}`;
    container.id = `${service_id}-${row_id}-config-td-${idPrefix}-div`;
    if (!show) container.style.display = 'none';

    const labelSpan = document.createElement('span');
    labelSpan.className = 'text-muted';
    labelSpan.style.fontSize = 'smaller';
    labelSpan.textContent = label;
    container.appendChild(labelSpan);

    container.appendChild(document.createElement('br'));

    const valueSpan = document.createElement('span');
    valueSpan.id = `${service_id}-${row_id}-config-td-${idPrefix}`;
    valueSpan.textContent = value || '';
    if ( idPrefix === "system" ) {
      valueSpan.setAttribute("data-header-element", "true");
      valueSpan.setAttribute("data-service", service_id);
      valueSpan.setAttribute("data-row", row_id);
      valueSpan.setAttribute("data-sse-credits", "");
      valueSpan.setAttribute("data-sse-credits-key", idPrefix);
    }
    container.appendChild(valueSpan);

    return container;
  }

  // Create main table row
  const tr = document.createElement('tr');

  var elementsNo = 2;
  // 1. Name <th>
  const thName = document.createElement('th');
  thName.scope = 'row';
  thName.className = 'name-td';
  thName.textContent = spawner.user_options?.name || 'Unnamed';
  tr.appendChild(thName);

  // 2. Configuration <td>
  const tdConfig = document.createElement('td');
  tdConfig.scope = 'row';
  tdConfig.className = 'config-td';

  const outerDiv = document.createElement('div');
  outerDiv.style.maxHeight = '152px';
  outerDiv.style.overflow = 'auto';

  const rowDiv = document.createElement('div');
  rowDiv.className = 'row mx-3 mb-1 justify-content-between g-0';

  const configInnerDiv = document.createElement('div');
  configInnerDiv.id = `${service_id}-${row_id}-config-td-div`;
  configInnerDiv.className = 'row col-12 col-md-6 col-lg-12 d-flex align-items-center';


  
  // Project (hide if empty)
  const project = spawner.user_options?.hpc?.project || '';

  // Partition (hide if empty)
  const partition = spawner.user_options?.hpc?.partition || '';
  
  // Repository Type (hide if empty)
  const repotypeRaw = spawner.user_options?.repo2docker?.repotype || '';
  const repotype = repotypeMapping[repotypeRaw] || repotypeRaw;

  // Repo URL Value (last path segment) (hide if empty)
  const repourlRaw = spawner.user_options?.repo2docker?.repourl || '';
  let repourlVal = '';
  if (repourlRaw) {
    try {
      const parts = repourlRaw.split('/').filter(s => s.trim() !== '');
      repourlVal = parts.length ? parts[parts.length - 1] : '';
    } catch {
      repourlVal = repourlRaw;
    }
  }

  if (!!project) {
    elementsNo += 1;
  }
  if (!!partition) {
    elementsNo += 1;
  }
  if (!!repotypeRaw) {
    elementsNo += 1;
  }
  if (!!repourlRaw) {
    elementsNo += 1;
  }

  // Adjust columns based on number of elements
  let columnswidth = 3;
  if (elementsNo == 2) {
    columnswidth = 6;
  } else {
    columnswidth = 3;
  }

  configInnerDiv.appendChild(createConfigItem(
    service_id, row_id, 'system', 'System', system, true, columnswidth
  ));
  const optionText = getServiceConfig(service_id).options[option].name;
  configInnerDiv.appendChild(createConfigItem(
    service_id, row_id, 'option', 'Option', optionText, true, columnswidth
  ));
  configInnerDiv.appendChild(createConfigItem(
    service_id, row_id, 'project', 'Project', project, !!project
  ));
  configInnerDiv.appendChild(createConfigItem(
    service_id, row_id, 'partition', 'Partition', partition, !!partition
  ));
  configInnerDiv.appendChild(createConfigItem(
    service_id, row_id, 'repotype', 'Repository Type', repotype, !!repotypeRaw
  ));
  configInnerDiv.appendChild(createConfigItem(
    service_id, row_id, 'repourl', 'Value', repourlVal, !!repourlRaw
  ));

  var elementsCount = configInnerDiv.children.length

  rowDiv.appendChild(configInnerDiv);
  outerDiv.appendChild(rowDiv);
  tdConfig.appendChild(outerDiv);
  tr.appendChild(tdConfig);

  // 3. Status <th> with progress bar
  const thStatus = document.createElement('th');
  thStatus.scope = 'row';
  thStatus.className = 'status-td';

  const statusContainer = document.createElement('div');
  statusContainer.className = 'd-flex justify-content-center';

  const progressBarParent = document.createElement('div');
  progressBarParent.id = `${service_id}-${row_id}-progress-bar-parent`;
  if (!(ready || active)) progressBarParent.style.display = 'none';

  const flexCol = document.createElement('div');
  flexCol.className = 'd-flex flex-column';

  // Progress bar container
  const progressBarDiv = document.createElement('div');
  progressBarDiv.className = 'd-flex justify-content-center progress';
  progressBarDiv.style.backgroundColor = '#d3e4f4';
  progressBarDiv.style.height = '20px';
  progressBarDiv.style.minWidth = '100px';
  progressBarDiv.style.position = 'relative';

  // Progress bar itself
  const progressBar = document.createElement('div');
  progressBar.id = `${service_id}-${row_id}-progress-bar`;
  progressBar.dataset.service = service_id;
  progressBar.dataset.row = row_id;

  // progress bar classes: always "progress-bar progress-bar-striped progress-bar-animated"
  progressBar.classList.add('progress-bar', 'progress-bar-striped', 'progress-bar-animated');
  if (ready) progressBar.classList.add('bg-success');
  progressBar.role = 'progressbar';
  // NOTE: Your original macro sets style width in px to progress (which looks odd). Possibly a bug?
  // Here I interpret progress as percent and set width as percentage.
  progressBar.style.width = `${progress}%`;
  progressBar.style.marginRight = 'auto';

  // Progress text on top
  const progressText = document.createElement('span');
  progressText.id = `${service_id}-${row_id}-progress-text`;
  progressText.style.position = 'absolute';
  progressText.style.width = '100px';
  progressText.style.textAlign = 'center';
  progressText.style.lineHeight = '20px';
  progressText.style.color = (typeof progress === 'number' && progress >= 60) ? 'white' : 'black';
  if (typeof progress === 'number' && progress > 0 && progress < 100) {
    progressText.textContent = `${progress}%`;
  }

  progressBarDiv.appendChild(progressBar);
  progressBarDiv.appendChild(progressText);

  // Progress info text below the bar
  const progressInfoText = document.createElement('span');
  progressInfoText.id = `${service_id}-${row_id}-progress-info-text`;
  progressInfoText.className = 'progress-info-text text-center text-muted';
  progressInfoText.style.fontSize = 'smaller';
  if (ready) {
    progressInfoText.textContent = 'running';
  } else if (active) {
    progressInfoText.textContent = 'starting';
  } else if (typeof progress === 'number' && progress === 99) {
    progressInfoText.textContent = 'cancelling';
  }

  flexCol.appendChild(progressBarDiv);
  flexCol.appendChild(progressInfoText);
  progressBarParent.appendChild(flexCol);
  statusContainer.appendChild(progressBarParent);
  thStatus.appendChild(statusContainer);
  tr.appendChild(thStatus);

  // 4. Actions <th> with buttons
  const thActions = document.createElement('th');
  thActions.scope = 'row';
  thActions.className = 'url-td text-center';
  thActions.style.whiteSpace = 'nowrap';

  // Helper to create a button with SVG + text, data attributes, and conditional display
  function createActionButton(idSuffix, btnClass, dataElement, isVisible, innerHTML) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.id = `${service_id}-${row_id}-${idSuffix}-btn-header`;
    btn.className = btnClass;
    btn.style.marginRight = "3px";
    btn.dataset.service = service_id;
    btn.dataset.row = row_id;
    btn.dataset.element = dataElement;
    if (!isVisible) btn.style.display = 'none';
    btn.innerHTML = innerHTML;
    return btn;
  }
  // SVG icon + label templates (use from svg parameter)
  const btnOpen = createActionButton(
    'open', 'btn btn-success', 'open',
    spawner.active,
    getSvg("open") + ' Open'
  );

  const btnStop = createActionButton(
    'stop', 'btn btn-danger', 'stop',
    spawner.ready,
    getSvg("stop") + ' Stop'
  );

  const btnCancel = createActionButton(
    'cancel', 'btn btn-danger', 'cancel',
    spawner.active && !spawner.ready,
    getSvg("stop") + ' Cancel'
  );

  const btnStart = createActionButton(
    'start', 'btn btn-primary', 'start',
    !spawner.active,
    getSvg("start") + ' Start'
  );

  const btnNA = createActionButton(
    'na', 'btn btn-secondary btn-na-lab', 'na',
    false,
    'N/A'
  );

  const btnDel = createActionButton(
    'del', 'btn btn-danger', 'del',
    false,
    getSvg("delete") + ' '
  );

  [btnOpen, btnStop, btnCancel, btnStart, btnNA, btnDel].forEach(btn => thActions.appendChild(btn));
  tr.appendChild(thActions);
  return tr.innerHTML;
}

function homeDefaultHeaderTypeWorkshop(spawner, service_id, row_id, row_options, service_options, svg) {
  const ready = spawner.ready;
  const active = spawner.active;
  const failed = spawner.failed;
  let progress = 0;
  const events = Array.isArray(spawner.events) ? spawner.events : [];
  const last_event = events.length > 0 ? events[events.length - 1] : null;

  if (ready) {
    progress = 100;
  } else if (active) {
    progress = (last_event && typeof last_event === 'object' && 'progress' in last_event) ? last_event.progress : 0;
  } else if (spawner.events) {
    progress = 0;
  }

  const system = spawner.user_options?.system || false;
  const name = spawner.user_options?.name || "";

  // Progress bar color & text
  const progressBarClasses = ready ? 'bg-success progress-bar progress-bar-striped progress-bar-animated' : 'progress-bar progress-bar-striped progress-bar-animated';

  const progressBarWidth = `${progress}px`; // same as in Jinja (px, not %)
  const progressTextColor = (typeof progress === 'number' && progress >= 60) ? 'white' : 'black';

  // Show/hide buttons conditions
  const page = pageType(null)
  const showStart = ["start", "spawn"].includes(page) && !active;
  const showCancel = ["start", "spawn"].includes(page) && (active && !ready);
  const showWorkshopCopy = !["start", "spawn"].includes(page);
  const showWorkshopUse = !["start", "spawn"].includes(page);
  const openDisabled = !ready;
  const openStyle = !active ? 'display: none;' : '';
  const stopStyle = !ready ? 'display: none;' : '';

  return `
    <th scope="row" class="name-td">${name}</th>
    <td scope="row" class="config-td">
      <div style="max-height: 152px; overflow: auto;">
        <div class="row mx-3 mb-1 justify-content-between">
          <div id="${service_id}-${row_id}-config-td-div" class="row col-12 col-md-6 col-lg-12 d-flex align-items-center">
            ${
              showWorkshopUse
              ? `<div id="${service_id}-${row_id}-config-td-system-div" class="col text-lg-center col-12 col-lg-6">
                  <span class="text-muted" style="font-size: smaller;">System</span><br>
                  <span id="${service_id}-${row_id}-config-td-system"
                    data-header-element="true"
                    data-service="${service_id}"
                    data-row="${row_id}"
                    data-sse-credits=""
                    data-sse-credits-key="system"
                  >${system}</span>
                </div>
                <div id="${service_id}-${row_id}-config-td-info-div" class="col text-lg-center col-12 col-lg-6">
                  <span class="text-muted" style="font-size: smaller;">Workshop ${name}</span><br>
                  <span id="${service_id}-${row_id}-config-td-info">Click "Use" to open workshop website.</span>
                </div>`
              : `<div id="${service_id}-${row_id}-config-td-system-div" class="col text-lg-center col-12 col-lg-6">
                  <span class="text-muted" style="font-size: smaller;">System</span><br>
                  <span id="${service_id}-${row_id}-config-td-system"
                    data-header-element="true"
                    data-service="${service_id}"
                    data-row="${row_id}"
                    data-sse-credits=""
                    data-sse-credits-key="system"
                  >${system}</span>
                </div>`
            }
          </div>
        </div>
      </div>
    </td>

    <th scope="row" class="status-td">
      <div class="d-flex justify-content-center">
        <div id="${service_id}-${row_id}-progress-bar-parent" ${!(ready || active) ? 'style="display: none"' : ''}>
          <div class="d-flex flex-column">
            <div class="d-flex justify-content-center progress" style="background-color: #d3e4f4; height: 20px; min-width: 100px;">
              <div id="${service_id}-${row_id}-progress-bar"
                data-service="${service_id}"
                data-row="${row_id}"
                class="${progressBarClasses}"
                role="progressbar"
                style="width: ${progressBarWidth}; margin-right: auto;"
              ></div>
              <span id="${service_id}-${row_id}-progress-text"
                style="position: absolute;
                  width: 100px;
                  text-align: center;
                  line-height: 20px;
                  color: ${progressTextColor};
                "
              >
                ${
                  (typeof progress === 'number' && progress > 0 && progress < 100)
                    ? `${progress}%`
                    : ''
                }
              </span>
            </div>
            <span id="${service_id}-${row_id}-progress-info-text" class="progress-info-text text-center text-muted" style="font-size: smaller;">
              ${
                ready ? 'running' :
                active ? 'starting' :
                (typeof progress === 'number' && progress === 99) ? 'cancelling' :
                ''
              }
            </span>
          </div>
        </div>
      </div>
    </th>

    <th scope="row" class="url-td text-center" style="white-space: nowrap">
      ${
        showStart ? `<button type="button"
          id="${service_id}-${row_id}-start-btn-header"
          class="btn btn-primary"
          data-service="${service_id}"
          data-row="${row_id}"
          data-element="start"        
          >
          ${getSvg("start")} Start
        </button>`: ''
      }
      ${
        showWorkshopCopy ? `<button type="button"
          id="${service_id}-${row_id}-workshopcopy-btn-header"
          data-service="${service_id}"
          data-row="${row_id}"
          data-show-always="true"
          data-element="workshopcopy"
          data-bs-toggle="tooltip"
          data-bs-placement="top"
          title="Copy Workshop link to clipboard"
          style="background-color: None !important"
          class="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md border border-gray-300 hover:bg-gray-100 active:bg-gray-200"
        >
          ${getSvg("copy")}
        </button>` : ''
      }
      ${
        showWorkshopCopy ? `<button type="button"
          id="${service_id}-${row_id}-manage-btn-header"
          class="btn btn-primary"
          data-service="${service_id}"
          data-row="${row_id}"
          data-element="manage"
          >
          ${getSvg("settings")} Use
        </button>`: ''
      }
      <button type="button"
        id="${service_id}-${row_id}-open-btn-header"
        class="btn btn-success"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="open"
        ${openDisabled ? 'disabled' : ''}
        style="${openStyle}"
      >
        ${getSvg("open")} Open
      </button>
      <button type="button"
        id="${service_id}-${row_id}-cancel-btn-header"
        class="btn btn-danger"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="cancel"
        ${!showCancel ? "style='display: none'": ''}
        >
        ${getSvg("stop")} Cancel
      </button>
      <button type="button"
        id="${service_id}-${row_id}-stop-btn-header"
        class="btn btn-danger"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="stop"
        style="${stopStyle}"
      >
        ${getSvg("stop")} Stop
      </button>
      <button type="button"
        id="${service_id}-${row_id}-del-btn-header"
        class="btn btn-danger"
        data-service="${service_id}"
        data-row="${row_id}"
        ${!showWorkshopCopy ? "style='display: none'": ''}
        data-element="del"
      >
        ${getSvg("delete")}
      </button>
    </th>
  `;
}

function homeDefaultHeaderTypeShare(spawner, service_id, row_id, row_options, service_options, svg) {
  // Helper to get nested values safely
  const get = (obj, key, def) => (obj && obj[key] !== undefined) ? obj[key] : def;

  const ready = !!spawner.ready;
  const active = !!spawner.active;
  const failed = !!spawner.failed;
  let progress = 0;

  const events = Array.isArray(spawner.events) ? spawner.events : [];
  const last_event = events.length ? events[events.length - 1] : null;

  if (ready) {
    progress = 100;
  } else if (active) {
    progress = (last_event && typeof last_event === 'object' && 'progress' in last_event) ? last_event.progress : 0;
  } else if (spawner.events) {
    progress = 0;
  }

  const userOptions = spawner.user_options || {};
  const name = get(userOptions, "name", "Unnamed");
  const system = get(userOptions, "system", false);
  const share_id = get(userOptions, "share_id", "unknown");

  // Progress bar color and text color logic
  const progressWidth = `${progress}px`;
  const progressTextColor = (typeof progress === 'number' && progress >= 60) ? 'white' : 'black';

  // Status text
  let statusText = '';
  if (ready) {
    statusText = 'running';
  } else if (active) {
    statusText = 'starting';
  } else if (progress === 99) {
    statusText = 'cancelling';
  }

  return `
    <th scope="row" class="name-td">${name}</th>
    <td scope="row" class="config-td">
      <div style="max-height: 152px; overflow: auto;">
        <div class="row mx-3 mb-1 justify-content-between">
          <div id="${service_id}-${row_id}-config-td-div" class="row col-12 col-md-6 col-lg-12 d-flex align-items-center">
            ${system ? `
              <div id="${service_id}-${row_id}-config-td-system-div" class="col text-lg-center col-12 col-lg-6">
                <span class="text-muted" style="font-size: smaller;">System</span><br>
                <span id="${service_id}-${row_id}-config-td-system"
                    data-header-element="true"
                    data-service="${service_id}"
                    data-row="${row_id}"
                    data-sse-credits=""
                    data-sse-credits-key="system"
                  >${system}</span>
              </div>
              <div id="${service_id}-${row_id}-config-td-info-div" class="col text-lg-center col-12 col-lg-6">
                <span class="text-muted" style="font-size: smaller;">Shared ${service_id}</span><br>
                <span id="${service_id}-${row_id}-config-td-info">Shared configuration (${share_id}).</span>
              </div>
            ` : `
              <div id="${service_id}-${row_id}-config-td-info-div" class="col text-lg-center col-12 col-lg-12">
                <span class="text-muted" style="font-size: smaller;">Shared ${service_id}</span><br>
                <span id="${service_id}-${row_id}-config-td-info">Shared configuration (${share_id}).</span>
              </div>
            `}
          </div>
        </div>
      </div>
    </td>

    <th scope="row" class="status-td">
      <div class="d-flex justify-content-center">
        <div id="${service_id}-${row_id}-progress-bar-parent" style="${!(ready || active) ? 'display: none' : ''}">
          <div class="d-flex flex-column">
            <div class="d-flex justify-content-center progress" style="background-color: #d3e4f4; height: 20px; min-width: 100px;">
              <div id="${service_id}-${row_id}-progress-bar"
                data-service="${service_id}"
                data-row="${row_id}"
                class="${ready ? 'bg-success ' : ''}progress-bar progress-bar-striped progress-bar-animated"
                role="progressbar"
                style="width: ${progressWidth}; margin-right: auto;">
              </div>
              <span id="${service_id}-${row_id}-progress-text"
                style="
                  position: absolute;
                  width: 100px;
                  text-align: center;
                  line-height: 20px;
                  color: ${progressTextColor};
                ">
                ${typeof progress === 'number' && progress > 0 && progress < 100 ? `${progress}%` : ''}
              </span>
            </div>
            <span id="${service_id}-${row_id}-progress-info-text" class="progress-info-text text-center text-muted" style="font-size: smaller;">
              ${statusText}
            </span>
          </div>
        </div>
      </div>
    </th>

    <th scope="row" class="url-td text-center" style="white-space: nowrap">
      <button type="button"
        id="${service_id}-${row_id}-sharecopy-btn-header"
        data-service="${service_id}"
        data-row="${row_id}"
        data-show-always="true"
        data-element="sharecopy"
        data-bs-toggle="tooltip"
        data-bs-placement="top"
        title="Copy Share link to clipboard"
        style="background-color: None !important"
        class="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-md border border-gray-300 hover:bg-gray-100 active:bg-gray-200">
        ${getSvg("copy")}
      </button>
      <button type="button"
        id="${service_id}-${row_id}-open-btn-header"
        class="btn btn-success"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="open"
        style="${!active ? 'display: none' : ''}">
        ${getSvg("open")} Open
      </button>
      <button type="button"
        id="${service_id}-${row_id}-stop-btn-header"
        class="btn btn-danger"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="stop"
        style="${!ready ? 'display: none' : ''}">
        ${getSvg("stop")} Stop
      </button>
      <button type="button"
        id="${service_id}-${row_id}-cancel-btn-header"
        class="btn btn-danger"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="cancel"
        style="${ready || !active ? 'display: none' : ''}">
        ${getSvg("stop")} Cancel
      </button>
      <button type="button"
        id="${service_id}-${row_id}-start-btn-header"
        class="btn btn-primary"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="start"
        style="${active ? 'display: none' : ''}">
        ${getSvg("start")} Start
      </button>
      <button type="button"
        id="${service_id}-${row_id}-na-btn-header"
        class="btn btn-secondary btn-na-lab disabled"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="na"
        style="display: none">
        ${getSvg("na")} N/A
      </button>
      <button type="button"
        id="${service_id}-${row_id}-del-btn-header"
        class="btn btn-danger"
        data-service="${service_id}"
        data-row="${row_id}"
        data-element="del"
        style="display: none">
        ${getSvg("delete")}
      </button>
    </th>
  `;
}

function homeDefaultHeaderTypeR2D(spawner, service_id, row_id, row_options, service_options, svg) {
  const ready = spawner.ready;
  const active = spawner.active;
  const failed = spawner.failed;
  let progress = 0;
  
  // Ensure events is an array (and not a string)
  const events = (Array.isArray(spawner.events) && typeof spawner.events !== "string") ? spawner.events : [];
  const last_event = events.length > 0 ? events[events.length - 1] : null;
  
  if (ready) {
    progress = 100;
  } else if (active) {
    progress = last_event && typeof last_event === 'object' && last_event.progress !== undefined ? last_event.progress : 0;
  } else if (spawner.events) {
    progress = 0;
  }

  const userOptions = spawner.user_options || {};
  const name = userOptions.name || "Unnamed";
  const system = userOptions.system || false;

  // Helper function to conditionally render style attribute
  const styleIf = (condition, style) => condition ? ` style="${style}"` : "";

  return `
<th scope="row" class="name-td">${name}</th>

<td scope="row" class="config-td">
  <div style="max-height: 152px; overflow: auto;">
    <div class="row mx-3 mb-1 justify-content-between">
      <div id="${service_id}-${row_id}-config-td-div" class="row col-12 col-md-6 col-lg-12 d-flex align-items-center">
        ${system ? `
          <div id="${service_id}-${row_id}-config-td-system-div" class="col text-lg-center col-12 col-lg-3">
            <span class="text-muted" style="font-size: smaller;">System</span><br>
            <span id="${service_id}-${row_id}-config-td-system"
                    data-header-element="true"
                    data-service="${service_id}"
                    data-row="${row_id}"
                    data-sse-credits=""
                    data-sse-credits-key="system"
                  >${system}</span>
          </div>
          <div id="${service_id}-${row_id}-config-td-info-div" class="col text-lg-center col-12 col-lg-9">
            <span class="text-muted" style="font-size: smaller;">Binder Configuration</span><br>
            <span id="${service_id}-${row_id}-config-td-info">Direct Link via Repo2Docker.</span>
          </div>
        ` : `
          <div id="${service_id}-${row_id}-config-td-info-div" class="col text-lg-center col-12 col-lg-12">
            <span class="text-muted" style="font-size: smaller;">Binder Configuration</span><br>
            <span id="${service_id}-${row_id}-config-td-info">Direct Link via Repo2Docker.</span>
          </div>
        `}
      </div>
    </div>
  </div>
</td>

<th scope="row" class="status-td">
  <div class="d-flex justify-content-center">
    <div id="${service_id}-${row_id}-progress-bar-parent"${!ready && !active ? ' style="display: none"' : ''}>
      <div class="d-flex flex-column">
        <div class="d-flex justify-content-center progress" style="background-color: #d3e4f4; height: 20px; min-width: 100px;">
          <div id="${service_id}-${row_id}-progress-bar"
            data-service="${service_id}"
            data-row="${row_id}"
            class="${ready ? 'bg-success ' : ''}progress-bar progress-bar-striped progress-bar-animated"
            role="progressbar"
            style="width: ${progress}px; margin-right: auto;"
          ></div>
          <span id="${service_id}-${row_id}-progress-text"
            style="
              position: absolute;
              width: 100px;
              text-align: center;
              line-height: 20px;
              color: ${(typeof progress === 'number' && progress >= 60) ? 'white' : 'black'};
            "
          >
            ${(typeof progress === 'number' && progress > 0 && progress < 100) ? progress + '%' : ''}
          </span>
        </div>
        <span id="${service_id}-${row_id}-progress-info-text" class="progress-info-text text-center text-muted" style="font-size: smaller;">
          ${ready ? 'running' : active ? 'starting' : (progress === 99 ? 'cancelling' : '')}
        </span>
      </div>
    </div>
  </div>
</th>

<th scope="row" class="url-td text-center" style="white-space: nowrap">
  <button type="button"
    id="${service_id}-${row_id}-open-btn-header"
    class="btn btn-success"
    data-service="${service_id}"
    data-row="${row_id}"
    data-element="open"
    ${!active ? 'style="display: none"' : ''}>
    ${getSvg("open")} Open
  </button>
  <button type="button"
    id="${service_id}-${row_id}-stop-btn-header"
    class="btn btn-danger"
    data-service="${service_id}"
    data-row="${row_id}"
    data-element="stop"
    ${!ready ? 'style="display: none"' : ''}>
    ${getSvg("stop")} Stop
  </button>
  <button type="button"
    id="${service_id}-${row_id}-cancel-btn-header"
    class="btn btn-danger"
    data-service="${service_id}"
    data-row="${row_id}"
    data-element="cancel"
    ${ready || !active ? 'style="display: none"' : ''}>
    ${getSvg("stop")} Cancel
  </button>
  <button type="button"
    id="${service_id}-${row_id}-start-btn-header"
    class="btn btn-primary"
    data-service="${service_id}"
    data-row="${row_id}"
    data-element="start"
    ${active ? 'style="display: none"' : ''}>
    ${getSvg("start")} Start
  </button>
  <button type="button"
    id="${service_id}-${row_id}-na-btn-header"
    class="btn btn-secondary btn-na-lab disabled"
    data-service="${service_id}"
    data-row="${row_id}"
    data-element="na"
    style="display: none">
    ${getSvg("na")} N/A
  </button>
  <button type="button"
    id="${service_id}-${row_id}-del-btn-header"
    class="btn btn-danger"
    data-service="${service_id}"
    data-row="${row_id}"
    data-element="del"
    style="display: none">
    ${getSvg("delete")}
  </button>
</th>
`;
}


function spawnDefaultHeader(service_id, row_id, row_options, service_options, svg) {
  let spawner = getSpawner(row_id);
  const userOptions = spawner.user_options || {};

  if (userOptions.workshop_id) {
    return homeDefaultHeaderTypeWorkshop(spawner, service_id, row_id, row_options, service_options, svg);
  } else if (userOptions.share_id) {
    return homeDefaultHeaderTypeShare(spawner, service_id, row_id, row_options, service_options, svg);
  } else if (userOptions.r2d_id) {
    return homeDefaultHeaderTypeR2D(spawner, service_id, row_id, row_options, service_options, svg);
  } else {
    return homeDefaultHeaderTypeNormal(spawner, service_id, row_id, row_options, service_options, svg);
  }
}

function getHomeDefaultHeader(service_id, row_id, row_options, service_options, svg) {
  let spawner = getSpawner(row_id);
  const userOptions = spawner.user_options || {};

  if (userOptions.workshop_id) {
    return homeDefaultHeaderTypeWorkshop(spawner, service_id, row_id, row_options, service_options, svg);
  } else if (userOptions.share_id) {
    return homeDefaultHeaderTypeShare(spawner, service_id, row_id, row_options, service_options, svg);
  } else if (userOptions.r2d_id) {
    return homeDefaultHeaderTypeR2D(spawner, service_id, row_id, row_options, service_options, svg);
  } else {
    return homeDefaultHeaderTypeNormal(spawner, service_id, row_id, row_options, service_options, svg);
  }
}


function getSpawnerType(rowOptions) {
  if ('r2d_id' in rowOptions) return 'r2d';
  if (rowOptions.workshop_id) return 'workshop';
  if ('share_id' in rowOptions) return 'share';
  return 'default';
}

function tcCreateHr(...args) {
  return `<hr>`;
}


const tcElementFactory = {
  multiple_checkboxes: tcCreateMultipleCheckboxes,
  selecthelper: tcCreateSelectHelper,
  text: tcCreateTextInput,
  storageentry: tcCreateStorageEntryInput,
  storagegrow: tcCreateStorageEntryInput,
  number: tcCreateNumberInput,
  flavorinfo: tcCreateFlavorInfo,
  flavorlegend: tcCreateFlavorLegend,
  select: tcCreateSelectInput,
  hr: tcCreateHr,
  checkbox: tcCreateCheckboxInput,
  reservationInfo: tcCreateReservationInfo,
  logcontainer: tcCreateLogContainer,
  buttons: tcCreateButtons
};


function appendRowToServiceTableHome(serviceId, rowId, rowOptions, serviceOptions, header, isFirstRow) {
  const tbody = document.querySelector(`#${serviceId}-table tbody`);
  if (!tbody) return;

  const spawnerType = getSpawnerType(rowOptions);

  const loadingTr = document.createElement('tr');
  loadingTr.id = `${serviceId}-${rowId}-loading-tr`;
  loadingTr.classList.add('summary-tr');
  loadingTr.setAttribute('data-service', serviceId);
  loadingTr.setAttribute('data-row', rowId);
  loadingTr.innerHTML = `
  <th></th>
  <th></th>
  <th>
  <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
  <div class="spinner-border" role="status" style="margin-right: 10px;">
  <span class="sr-only">Loading...</span>
  </div>
  <p style="margin: 0;">Loading ...</p>
  </div>
  </th>
  <th></th>
  <th></th>
  `;

  const summaryTr = document.createElement('tr');
  summaryTr.id = `${serviceId}-${rowId}-summary-tr`;
  summaryTr.dataset.serverId = `${serviceId}-${rowId}`;
  if ( isFirstRow ) {
    summaryTr.classList.add('summary-tr', 'new-spawner-tr');
  } else {
    if ( getSpawnerType(rowOptions) != "workshop" ) summaryTr.style.display = 'none';
    summaryTr.classList.add('summary-tr', 'existing-spawner-tr');
    summaryTr.setAttribute('data-sse-servers', '');
    summaryTr.setAttribute('data-sse-progress', '');
  }
  summaryTr.setAttribute('data-service', serviceId);
  summaryTr.setAttribute('data-row', rowId);
  summaryTr.setAttribute('data-spawner-type', spawnerType);

  const spawner = getSpawner(rowId);
  summaryTr.setAttribute('data-spawner-active', spawner.active);
  summaryTr.setAttribute('data-spawner-ready', spawner.ready);

  const td = document.createElement('td');
  td.classList.add('details-td');
  td.setAttribute('bs-target', `#${rowId}-collapse`);

  if ( isFirstRow ) {
    td.innerHTML = `<div class="d-flex mx-4">${getSvg("plus")}</div>`;
  } else {
    td.innerHTML = `<div class="d-flex accordion-icon collapsed mx-4"></div>`;
  }
  summaryTr.appendChild(td);

  // Header row content
  let headerCells; 
  headerCells = header(serviceId, rowId, rowOptions, serviceOptions);
  summaryTr.appendChild(htmlToElement(headerCells));

  if ( getSpawnerType(rowOptions) != "workshop" ) tbody.appendChild(loadingTr);
  tbody.appendChild(summaryTr);
  

// Add collapsible row
  let navbarButtons = ``;
  if (serviceOptions.navbar && Object.keys(serviceOptions.navbar).length > 0) {
    let buttons = ``;
    for (const [index, [buttonId, buttonOptions]] of Object.entries(serviceOptions.navbar).entries()) {
      const showForFirstRow = isFirstRow && (buttonOptions.firstRow ?? true);
      const showForDefaultRow = !isFirstRow && (buttonOptions.defaultRow ?? true);
      const showForPageType = pageType(null) === pageType("spawn") || pageType(null) === pageType("start");
      if (showForFirstRow || showForDefaultRow || showForPageType) {
        const show = buttonOptions.show ?? true;
        const margins = buttonOptions.margins ?? "mb-3";
        const isFirst = index === 0;
        const dependencies = buttonOptions.dependency ?? {};
        const buttonClass = [
          "nav-link",
          margins,
          isFirst ? "active" : ""
        ].join(" ").trim();
        const styleAttr = !show ? ` style="height: 0 !important; overflow: hidden !important; padding-top: 0 !important; padding-bottom: 0 !important; border: none !important; margin: 0 !important;"` : "";
        let dependencyAttributes = "";
        for (const [key, values] of Object.entries(dependencies)) {
          dependencyAttributes += ` data-dependency-${key}="true"`;
          for (const val of values) {
            dependencyAttributes += ` data-dependency-${key}-${val}="true"`;
          }
        }
        const triggerKeys = Object.keys(buttonOptions?.trigger ?? {})
          .map(key => `data-trigger-${key}`)
          .join(' ');
        buttons += `
          <button 
            class="${buttonClass}"
            id="${serviceId}-${rowId}-${buttonId}-navbar-button"${styleAttr}
            name="${buttonId}"
            data-tab="${buttonId}"
            data-service="${serviceId}"
            data-row="${rowId}"
            ${triggerKeys}
            data-bs-toggle="pill"
            data-bs-target="#${serviceId}-${rowId}-${buttonId}"
            ${show ? 'data-show="true"' : ""}
            type="button"
            ${dependencyAttributes}
            role="tab"
          >
            <span>${buttonOptions.displayName || "Unknown Button"}</span>
            <span
              id="${serviceId}-${rowId}-${buttonId}-tab-input-warning"
              data-type="span-warning"
              class="d-flex invisible"
            >
              ${getSvg("warning")}
              <span class="visually-hidden">settings changed</span>
            </span>
          </button>
        `;
      }
      navbarButtons = `
        <div id="${serviceId}-${rowId}-tab-button-div" role="tablist" class="nav flex-column nav-pills p-3 ps-0" style="min-width: 15% !important">
          ${buttons}
        </div>
      `;
    }

    let tabsDiv = ``;
    let buttonRow = ``;
    let first = true;
    for (const [tabId, tabOptions] of Object.entries(serviceOptions.tabs)) {
      let rowContent = tcRowContent(serviceId, serviceOptions, rowId, tabId, isFirstRow);
      const show = first || tabId === "buttonrow";
      const classes = show ? "tab-pane fade show active" : "tab-pane fade";
      const style = show ? "" : " style='display: none'";
      let div = `
        <div class="${classes}"${style} id="${serviceId}-${rowId}-${tabId}-contenttab-div" role="tabpanel">
          <div class="row">
            ${rowContent}
          </div>
        </div>
      `
      if ( tabId === "buttonrow" ) {
        buttonRow = div;
      } else {
        tabsDiv += div;
        first = false;
      }
    }
    let contentDiv = `
      <div 
        id="${serviceId}-${rowId}-tabContent-div"
        class="tab-content w-100"
        data-row="${rowId}"
        data-service="${serviceId}"
      >
        <form id="${serviceId}-${rowId}-form">
          ${tabsDiv}
          ${buttonRow}
        </form>
      </div>
    `;

    if ( getSpawnerType(rowOptions) != "workshop" ) {
      const collapsibleHtml = `
        <tr data-server-id="${serviceId}-${rowId}" id="${serviceId}-${rowId}-collapsible-tr" class="collapsible-tr">
          <td colspan="100" class="p-0">
            <div id="${serviceId}-${rowId}-collapse" class="collapse" data-row="${rowId}">
              <div class="d-flex align-items-start m-3">
                ${navbarButtons}
                ${contentDiv}
              </div>
            </div>
          </td>
        </tr>
      `;

      tbody.appendChild(htmlToElement(collapsibleHtml));
    }
  }
}

function appendRowToServiceTableStart(serviceId, rowId, rowOptions, serviceOptions, header, isFirstRow) {
  const tbody = document.querySelector(`#${serviceId}-table tbody`);
  if (!tbody) return;

  const spawnerType = getSpawnerType(rowOptions);
  const spawner = getSpawner(rowId);

  const loadingTr = document.createElement('tr');
  loadingTr.id = `${serviceId}-${rowId}-loading-tr`;
  loadingTr.classList.add('summary-tr');
  loadingTr.setAttribute('data-service', serviceId);
  loadingTr.setAttribute('data-row', rowId);
  loadingTr.innerHTML = `
  <th></th>
  <th></th>
  <th>
  <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
  <div class="spinner-border" role="status" style="margin-right: 10px;">
  <span class="sr-only">Loading...</span>
  </div>
  <p style="margin: 0;">Loading ...</p>
  </div>
  </th>
  <th></th>
  <th></th>
  `;

  const summaryTr = document.createElement('tr');
  summaryTr.id = `${serviceId}-${rowId}-summary-tr`;
  summaryTr.dataset.serverId = `${serviceId}-${rowId}`;
  if ( getSpawnerType(rowOptions) != "workshop" ) summaryTr.style.display = 'none';
  summaryTr.classList.add('summary-tr', 'existing-spawner-tr');
  summaryTr.setAttribute('data-sse-servers', '');
  summaryTr.setAttribute('data-sse-progress', '');
  summaryTr.setAttribute('data-service', serviceId);
  summaryTr.setAttribute('data-row', rowId);
  summaryTr.setAttribute('data-spawner-type', spawnerType);

  const td = document.createElement('td');
  td.classList.add('details-td');
  td.setAttribute('bs-target', `#${rowId}-collapse`);
  td.innerHTML = `<div class="d-flex accordion-icon collapsed mx-4"></div>`;
  summaryTr.appendChild(td);

  // Header row content
  const headerCells = header(serviceId, rowId, rowOptions, serviceOptions);
  summaryTr.appendChild(htmlToElement(headerCells));

  tbody.appendChild(loadingTr);
  tbody.appendChild(summaryTr);  

  // Add collapsible row
    let navbarButtons = ``;
    if (serviceOptions.navbar && Object.keys(serviceOptions.navbar).length > 0) {
      let buttons = ``;
      for (const [index, [buttonId, buttonOptions]] of Object.entries(serviceOptions.navbar).entries()) {
        const showForFirstRow = isFirstRow && (buttonOptions.firstRow ?? true);
        const showForDefaultRow = !isFirstRow && (buttonOptions.defaultRow ?? true);
        const showForPageType = pageType(null) === pageType("spawn") || pageType(null) === pageType("start");
        if (showForFirstRow || showForDefaultRow || showForPageType) {
          const show = buttonOptions.show ?? true;
          const margins = buttonOptions.margins ?? "mb-3";
          const isFirst = index === 0;
          const dependencies = buttonOptions.dependency ?? {};
          const buttonClass = [
            "nav-link",
            margins,
            isFirst ? "active" : ""
          ].join(" ").trim();
          const styleAttr = !show ? ` style="height: 0 !important; overflow: hidden !important; padding-top: 0 !important; padding-bottom: 0 !important; border: none !important; margin: 0 !important;"` : "";
          let dependencyAttributes = "";
          for (const [key, values] of Object.entries(dependencies)) {
            dependencyAttributes += ` data-dependency-${key}="true"`;
            for (const val of values) {
              dependencyAttributes += ` data-dependency-${key}-${val}="true"`;
            }
          }
          const triggerKeys = Object.keys(buttonOptions?.trigger ?? {})
            .map(key => `data-trigger-${key}`)
            .join(' ');
          buttons += `
            <button 
              class="${buttonClass}"
              id="${serviceId}-${rowId}-${buttonId}-navbar-button"${styleAttr}
              name="${buttonId}"
              data-tab="${buttonId}"
              data-service="${serviceId}"
              data-row="${rowId}"
              ${triggerKeys}
              data-bs-toggle="pill"
              data-bs-target="#${serviceId}-${rowId}-${buttonId}"
              ${show ? 'data-show="true"' : ""}
              type="button"
              ${dependencyAttributes}
              role="tab"
            >
              <span>${buttonOptions.displayName || "Unknown Button"}</span>
              <span
                id="${serviceId}-${rowId}-${buttonId}-tab-input-warning"
                data-type="span-warning"
                class="d-flex invisible"
              >
                ${getSvg("warning")}
                <span class="visually-hidden">settings changed</span>
              </span>
            </button>
          `;
        }
      }
      navbarButtons = `
        <div id="${serviceId}-${rowId}-tab-button-div" role="tablist" class="nav flex-column nav-pills p-3 ps-0" style="min-width: 15% !important">
          ${buttons}
        </div>
      `;

    let tabsDiv = ``;
    let buttonRow = ``;
    let first = true;
    for (const [tabId, tabOptions] of Object.entries(serviceOptions.tabs)) {
      let rowContent = tcRowContent(serviceId, serviceOptions, rowId, tabId, isFirstRow);
      const show = first || tabId === "buttonrow";
      const classes = show ? "tab-pane fade show active" : "tab-pane fade";
      const style = show ? "" : " style='display: none'";
      let div = `
        <div class="${classes}"${style} id="${serviceId}-${rowId}-${tabId}-contenttab-div" role="tabpanel">
          <div class="row">
            ${rowContent}
          </div>
        </div>
      `
      if ( tabId === "buttonrow" ) {
        buttonRow = div;
      } else {
        tabsDiv += div;
        first = false;
      }
    }

    let contentDiv = `
      <div 
        id="${serviceId}-${rowId}-tabContent-div"
        class="tab-content w-100"
        data-row="${rowId}"
        data-service="${serviceId}"
      >
        <form id="${serviceId}-${rowId}-form">
          ${tabsDiv}
          ${buttonRow}
        </form>
      </div>
    `;

    const collapsibleHtml = `
      <tr data-server-id="${serviceId}-${rowId}" id="${serviceId}-${rowId}-collapsible-tr" class="collapsible-tr">
        <td colspan="100" class="p-0">
          <div id="${serviceId}-${rowId}-collapse" class="collapse" data-row="${rowId}">
            <div class="d-flex align-items-start m-3">
              ${navbarButtons}
              ${contentDiv}
            </div>
          </div>
        </td>
      </tr>
    `;

    tbody.appendChild(htmlToElement(collapsibleHtml));
  }
}

function appendRowToServiceTableBkp(serviceId, rowId, rowOptions, serviceOptions, header, isFirstRow) {
  const tbody = document.querySelector(`#${serviceId}-table tbody`);
  if (!tbody) return;

  const spawnerType = getSpawnerType(rowOptions);

  const loadingTr = document.createElement('tr');
  loadingTr.id = `${serviceId}-${rowId}-loading-tr`;
  loadingTr.classList.add('summary-tr');
  loadingTr.setAttribute('data-service', serviceId);
  loadingTr.setAttribute('data-row', rowId);
  loadingTr.innerHTML = `
  <th></th>
  <th></th>
  <th>
  <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
  <div class="spinner-border" role="status" style="margin-right: 10px;">
  <span class="sr-only">Loading...</span>
  </div>
  <p style="margin: 0;">Loading ...</p>
  </div>
  </th>
  <th></th>
  <th></th>
  `;

  const summaryTr = document.createElement('tr');
  summaryTr.id = `${serviceId}-${rowId}-summary-tr`;
  summaryTr.dataset.serverId = `${serviceId}-${rowId}`;
  if ( isFirstRow ) {
    summaryTr.classList.add('summary-tr', 'new-spawner-tr');
  } else {
    if ( getSpawnerType(rowOptions) != "workshop" ) summaryTr.style.display = 'none';
    summaryTr.classList.add('summary-tr', 'existing-spawner-tr');
    summaryTr.setAttribute('data-sse-servers', '');
    summaryTr.setAttribute('data-sse-progress', '');
  }
  summaryTr.setAttribute('data-service', serviceId);
  summaryTr.setAttribute('data-row', rowId);
  summaryTr.setAttribute('data-spawner-type', spawnerType);

  // Sample values. Replace with actual spawner state
  summaryTr.setAttribute('data-spawner-active', 'false');
  summaryTr.setAttribute('data-spawner-ready', 'false');

  const td = document.createElement('td');
  td.classList.add('details-td');
  td.setAttribute('bs-target', `#${rowId}-collapse`);

  if ( isFirstRow ) {
    td.innerHTML = `<div class="d-flex mx-4">${getSvg("plus")}</div>`;
  } else {
    td.innerHTML = `<div class="d-flex accordion-icon collapsed mx-4"></div>`;
  }
  summaryTr.appendChild(td);

  // Header row content
  const headerCells = header(serviceId, rowId, rowOptions, serviceOptions);
  summaryTr.appendChild(htmlToElement(headerCells));

  if ( getSpawnerType(rowOptions) != "workshop" ) tbody.appendChild(loadingTr);
  tbody.appendChild(summaryTr);
  

  // Add collapsible row
  if ( getSpawnerType(rowOptions) != "workshop" ) {
    let navbarButtons = ``;
    if (serviceOptions.navbar && Object.keys(serviceOptions.navbar).length > 0) {
      let buttons = ``;
      for (const [index, [buttonId, buttonOptions]] of Object.entries(serviceOptions.navbar).entries()) {
        const showForFirstRow = isFirstRow && (buttonOptions.firstRow ?? true);
        const showForDefaultRow = !isFirstRow && (buttonOptions.defaultRow ?? true);
        const showForPageType = pageType(null) === pageType("spawn") || pageType(null) === pageType("start");
        if (showForFirstRow || showForDefaultRow || showForPageType) {
          const show = buttonOptions.show ?? true;
          const margins = buttonOptions.margins ?? "mb-3";
          const isFirst = index === 0;
          const dependencies = buttonOptions.dependency ?? {};
          const buttonClass = [
            "nav-link",
            margins,
            isFirst ? "active" : ""
          ].join(" ").trim();
          const styleAttr = !show ? ` style="height: 0 !important; overflow: hidden !important; padding-top: 0 !important; padding-bottom: 0 !important; border: none !important; margin: 0 !important;"` : "";
          let dependencyAttributes = "";
          for (const [key, values] of Object.entries(dependencies)) {
            dependencyAttributes += ` data-dependency-${key}="true"`;
            for (const val of values) {
              dependencyAttributes += ` data-dependency-${key}-${val}="true"`;
            }
          }
          const triggerKeys = Object.keys(buttonOptions?.trigger ?? {})
            .map(key => `data-trigger-${key}`)
            .join(' ');
          buttons += `
            <button 
              class="${buttonClass}"
              id="${serviceId}-${rowId}-${buttonId}-navbar-button"${styleAttr}
              name="${buttonId}"
              data-tab="${buttonId}"
              data-service="${serviceId}"
              data-row="${rowId}"
              ${triggerKeys}
              data-bs-toggle="pill"
              data-bs-target="#${serviceId}-${rowId}-${buttonId}"
              ${show ? 'data-show="true"' : ""}
              type="button"
              ${dependencyAttributes}
              role="tab"
            >
              <span>${buttonOptions.displayName || "Unknown Button"}</span>
              <span
                id="${serviceId}-${rowId}-${buttonId}-tab-input-warning"
                data-type="span-warning"
                class="d-flex invisible"
              >
                ${getSvg("warning")}
                <span class="visually-hidden">settings changed</span>
              </span>
            </button>
          `;
        }
      }
      navbarButtons = `
        <div id="${serviceId}-${rowId}-tab-button-div" role="tablist" class="nav flex-column nav-pills p-3 ps-0" style="min-width: 15% !important">
          ${buttons}
        </div>
      `;
    }

    let tabsDiv = ``;
    let buttonRow = ``;
    let first = true;
    for (const [tabId, tabOptions] of Object.entries(serviceOptions.tabs)) {
      let rowContent = tcRowContent(serviceId, serviceOptions, rowId, tabId, isFirstRow);
      const show = first || tabId === "buttonrow";
      const classes = show ? "tab-pane fade show active" : "tab-pane fade";
      const style = show ? "" : " style='display: none'";
      let div = `
        <div class="${classes}"${style} id="${serviceId}-${rowId}-${tabId}-contenttab-div" role="tabpanel">
          <div class="row">
            ${rowContent}
          </div>
        </div>
      `
      if ( tabId === "buttonrow" ) {
        buttonRow = div;
      } else {
        tabsDiv += div;
        first = false;
      }
    }

    let contentDiv = `
      <div 
        id="${serviceId}-${rowId}-tabContent-div"
        class="tab-content w-100"
        data-row="${rowId}"
        data-service="${serviceId}"
      >
        <form id="${serviceId}-${rowId}-form">
          ${tabsDiv}
          ${buttonRow}
        </form>
      </div>
    `;

    const collapsibleHtml = `
      <tr data-server-id="${serviceId}-${rowId}" id="${serviceId}-${rowId}-collapsible-tr" class="collapsible-tr">
        <td colspan="100" class="p-0">
          <div id="${serviceId}-${rowId}-collapse" class="collapse" data-row="${rowId}">
            <div class="d-flex align-items-start m-3">
              ${navbarButtons}
              ${contentDiv}
            </div>
          </div>
        </td>
      </tr>
    `;

    tbody.appendChild(htmlToElement(collapsibleHtml));
  }
}

function appendRowToServiceTableWorkshop(serviceId, rowId, rowOptions, serviceOptions, header, isFirstRow) {
  const tbody = document.querySelector(`#${serviceId}-table tbody`);
  if (!tbody) return;

  const spawnerType = getSpawnerType(rowOptions);

  const summaryTr = document.createElement('tr');
  summaryTr.id = `${serviceId}-${rowId}-summary-tr`;
  summaryTr.dataset.serverId = `${serviceId}-${rowId}`;
  summaryTr.style.display = 'none';
  summaryTr.classList.add('summary-tr', 'existing-spawner-tr');
  summaryTr.setAttribute('data-sse-servers', '');
  summaryTr.setAttribute('data-sse-progress', '');
  summaryTr.setAttribute('data-service', serviceId);
  summaryTr.setAttribute('data-row', rowId);
  summaryTr.setAttribute('data-spawner-type', spawnerType);

  // Sample values. Replace with actual spawner state
  summaryTr.setAttribute('data-spawner-active', 'false');
  summaryTr.setAttribute('data-spawner-ready', 'false');

  const td = document.createElement('td');
  td.classList.add('details-td');
  td.setAttribute('bs-target', `#${rowId}-collapse`);

  td.innerHTML = `<div class="d-flex accordion-icon collapsed mx-4"></div>`;
  summaryTr.appendChild(td);

  // Header row content
  const headerCells = header(serviceId, rowId, rowOptions, serviceOptions);
  summaryTr.appendChild(htmlToElement(headerCells));

  tbody.appendChild(summaryTr);
  

  // Add collapsible row
  let navbarButtons = ``;
  if (serviceOptions.navbar && Object.keys(serviceOptions.navbar).length > 0) {
    let buttons = ``;
    for (const [index, [buttonId, buttonOptions]] of Object.entries(serviceOptions.navbar).entries()) {
      const showForFirstRow = isFirstRow && (buttonOptions.firstRow ?? true);
      const showForDefaultRow = !isFirstRow && (buttonOptions.defaultRow ?? true);
      const showForPageType = pageType(null) === pageType("spawn") || pageType(null) === pageType("start");
      if (showForFirstRow || showForDefaultRow || showForPageType) {
        const show = buttonOptions.show ?? true;
        const margins = buttonOptions.margins ?? "mb-3";
        const isFirst = index === 0;
        const dependencies = buttonOptions.dependency ?? {};
        const buttonClass = [
          "nav-link",
          margins,
          isFirst ? "active" : ""
        ].join(" ").trim();
        const styleAttr = !show ? ` style="height: 0 !important; overflow: hidden !important; padding-top: 0 !important; padding-bottom: 0 !important; border: none !important; margin: 0 !important;"` : "";
        let dependencyAttributes = "";
        for (const [key, values] of Object.entries(dependencies)) {
          dependencyAttributes += ` data-dependency-${key}="true"`;
          for (const val of values) {
            dependencyAttributes += ` data-dependency-${key}-${val}="true"`;
          }
        }
        const triggerKeys = Object.keys(buttonOptions?.trigger ?? {})
          .map(key => `data-trigger-${key}`)
          .join(' ');
        buttons += `
          <button 
            class="${buttonClass}"
            id="${serviceId}-${rowId}-${buttonId}-navbar-button"${styleAttr}
            name="${buttonId}"
            data-tab="${buttonId}"
            data-service="${serviceId}"
            data-row="${rowId}"
            ${triggerKeys}
            data-bs-toggle="pill"
            data-bs-target="#${serviceId}-${rowId}-${buttonId}"
            ${show ? 'data-show="true"' : ""}
            type="button"
            ${dependencyAttributes}
            role="tab"
          >
            <span>${buttonOptions.displayName || "Unknown Button"}</span>
            <span
              id="${serviceId}-${rowId}-${buttonId}-tab-input-warning"
              data-type="span-warning"
              class="d-flex invisible"
            >
              ${getSvg("warning")}
              <span class="visually-hidden">settings changed</span>
            </span>
          </button>
        `;
      }
    }
    navbarButtons = `
      <div id="${serviceId}-${rowId}-tab-button-div" role="tablist" class="nav flex-column nav-pills p-3 ps-0" style="min-width: 15% !important">
        ${buttons}
      </div>
    `;

    let tabsDiv = ``;
    let buttonRow = ``;
    let first = true;
    for (const [tabId, tabOptions] of Object.entries(serviceOptions.tabs)) {
      let rowContent = tcRowContent(serviceId, serviceOptions, rowId, tabId, isFirstRow);
      const show = first || tabId === "buttonrow";
      const classes = show ? "tab-pane fade show active" : "tab-pane fade";
      const style = show ? "" : " style='display: none'";
      let div = `
        <div class="${classes}"${style} id="${serviceId}-${rowId}-${tabId}-contenttab-div" role="tabpanel">
          <div class="row">
            ${rowContent}
          </div>
        </div>
      `
      if ( tabId === "buttonrow" ) {
        buttonRow = div;
      } else {
        tabsDiv += div;
        first = false;
      }
    }

    let contentDiv = `
      <div 
        id="${serviceId}-${rowId}-tabContent-div"
        class="tab-content w-100"
        data-row="${rowId}"
        data-service="${serviceId}"
      >
        <form id="${serviceId}-${rowId}-form">
          ${tabsDiv}
          ${buttonRow}
        </form>
      </div>
    `;

    const collapsibleHtml = `
      <tr data-server-id="${serviceId}-${rowId}" id="${serviceId}-${rowId}-collapsible-tr" class="collapsible-tr">
        <td colspan="100" class="p-0">
          <div id="${serviceId}-${rowId}-collapse" class="collapse" data-row="${rowId}">
            <div class="d-flex align-items-start m-3">
              ${navbarButtons}
              ${contentDiv}
            </div>
          </div>
        </td>
      </tr>
    `;

    tbody.appendChild(htmlToElement(collapsibleHtml));
  }
}

function appendRowToServiceTableWorkshopManager(serviceId, rowId, rowOptions, serviceOptions, header, isFirstRow) {
  const tbody = document.querySelector(`#${serviceId}-table tbody`);
  if (!tbody) return;

  const loadingTr = document.createElement('tr');
  loadingTr.id = `${serviceId}-${rowId}-loading-tr`;
  loadingTr.classList.add('summary-tr');
  loadingTr.setAttribute('data-service', serviceId);
  loadingTr.setAttribute('data-row', rowId);
  loadingTr.innerHTML = `
    <th></th>
    <th></th>
    <th>
    <div style="display: flex; align-items: center; justify-content: center; height: 100%;">
    <div class="spinner-border" role="status" style="margin-right: 10px;">
    <span class="sr-only">Loading...</span>
    </div>
    <p style="margin: 0;">Loading ...</p>
    </div>
    </th>
    <th></th>
  `;

  const summaryTr = document.createElement('tr');
  summaryTr.id = `${serviceId}-${rowId}-summary-tr`;
  summaryTr.dataset.serverId = `${serviceId}-${rowId}`;
  if ( isFirstRow ) {
    summaryTr.classList.add('summary-tr', 'new-spawner-tr');
  } else {
    summaryTr.style.display = 'none';
    summaryTr.classList.add('summary-tr', 'existing-spawner-tr');
    summaryTr.setAttribute('data-sse-servers', '');
    summaryTr.setAttribute('data-sse-progress', '');
  }
  summaryTr.setAttribute('data-service', serviceId);
  summaryTr.setAttribute('data-row', rowId);

  const td = document.createElement('td');
  td.classList.add('details-td');
  td.setAttribute('bs-target', `#${rowId}-collapse`);

  if ( isFirstRow ) {
    td.innerHTML = `<div class="d-flex mx-4">${getSvg("plus")}</div>`;
  } else {
    td.innerHTML = `<div class="d-flex accordion-icon collapsed mx-4"></div>`;
  }
  summaryTr.appendChild(td);

  // Header row content
  const headerCells = header(serviceId, rowId, rowOptions, serviceOptions);
  summaryTr.appendChild(htmlToElement(headerCells));
  
  tbody.appendChild(loadingTr);
  tbody.appendChild(summaryTr);
  

  // Add collapsible row

  let tabsDiv = ``;
  let buttonRow = ``;
  let first = true;
  for (const [tabId, tabOptions] of Object.entries(serviceOptions.tabs)) {
    let rowContent = tcRowContent(serviceId, serviceOptions, rowId, tabId, isFirstRow);
    const show = first || tabId === "buttonrow";
    const classes = show ? "tab-pane fade show active" : "tab-pane fade";
    const style = show ? "" : " style='display: none'";
    let div = `
      <div class="${classes}"${style} id="${serviceId}-${rowId}-${tabId}-contenttab-div" role="tabpanel">
        <div class="row">
          ${rowContent}
        </div>
      </div>
    `
    if ( tabId === "buttonrow" ) {
      buttonRow = div;
    } else {
      tabsDiv += div;
      first = false;
    }
  }

  let contentDiv = `
    <div 
      id="${serviceId}-${rowId}-tabContent-div"
      class="tab-content w-100"
      data-row="${rowId}"
      data-service="${serviceId}"
    >
      <form id="${serviceId}-${rowId}-form">
        ${tabsDiv}
        ${buttonRow}
      </form>
    </div>
  `;

  const collapsibleHtml = `
    <tr data-server-id="${serviceId}-${rowId}" id="${serviceId}-${rowId}-collapsible-tr" class="collapsible-tr">
      <td colspan="100" class="p-0">
        <div id="${serviceId}-${rowId}-collapse" class="collapse" data-row="${rowId}">
          <div class="d-flex align-items-start m-3">
            ${contentDiv}
          </div>
        </div>
      </td>
    </tr>
  `;

  tbody.appendChild(htmlToElement(collapsibleHtml));
}
