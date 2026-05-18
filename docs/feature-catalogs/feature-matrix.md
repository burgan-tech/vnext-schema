# vNext Feature Catalog Matrix
> Generated from `features.json` (schema version 1.0.0)  
> Date: 2026-05-13

## Component Overview

| Component | Fields | Earliest Since | Latest Since |
|-----------|--------|----------------|---------------|
| core-header | 48 | 0.0.1 | 0.0.1 |
| core-schema | 7 | 0.0.1 | 0.0.1 |
| extension | 17 | 0.0.1 | 0.0.1 |
| function | 32 | 0.0.1 | 0.0.1 |
| schema | 33 | 0.0.1 | 0.0.1 |
| task | 1 | 0.0.1 | 0.0.1 |
| view | 7 | 0.0.1 | 0.0.1 |
| workflow | 368 | 0.0.1 | 0.0.44 |

---

## core-header

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| schema | object | 0.0.1 | Yes | - | - |
| schema.acceptLanguage | string | 0.0.1 | Yes | - | - |
| schema.actor | object | 0.0.1 | Yes | - | - |
| schema.actor.consentId | string | 0.0.1 | Yes | - | - |
| schema.actor.raw | string | 0.0.1 | Yes | - | - |
| schema.actor.scope | string | 0.0.1 | Yes | - | - |
| schema.actor.user | string | 0.0.1 | Yes | - | - |
| schema.client | object | 0.0.1 | Yes | - | - |
| schema.client.ipAddress | union | 0.0.1 | Yes | - | - |
| schema.client.port | number | 0.0.1 | Yes | - | - |
| schema.device | object | 0.0.1 | Yes | - | - |
| schema.device.deviceId | string | 0.0.1 | Yes | - | - |
| schema.device.installationId | string | 0.0.1 | Yes | - | - |
| schema.device.raw | string | 0.0.1 | Yes | - | - |
| schema.geolocation | object | 0.0.1 | Yes | - | - |
| schema.geolocation.accuracy | number | 0.0.1 | Yes | - | - |
| schema.geolocation.altitude | number | 0.0.1 | Yes | - | - |
| schema.geolocation.latitude | number | 0.0.1 | Yes | - | - |
| schema.geolocation.longitude | number | 0.0.1 | Yes | - | - |
| schema.geolocation.timestamp | string | 0.0.1 | Yes | - | - |
| schema.ifNoneMatch | string | 0.0.1 | Yes | - | - |
| schema.requestSource | object | 0.0.1 | Yes | - | - |
| schema.requestSource.componentType | enum | 0.0.1 | Yes | - | router-navigation (0.0.1), workflow-transition (0.0.1), dynamic-view-render (0.0.1), static-view-load (0.0.1), webview-request (0.0.1) (+5 more) |
| schema.requestSource.raw | string | 0.0.1 | Yes | - | - |
| schema.requestSource.targetInfo | string | 0.0.1 | Yes | - | - |
| schema.requestTimestamp | string | 0.0.1 | Yes | - | - |
| schema.serverTimestamp | string | 0.0.1 | Yes | - | - |
| schema.traceparent | object | 0.0.1 | Yes | - | - |
| schema.traceparent.parentId | string | 0.0.1 | Yes | - | - |
| schema.traceparent.raw | string | 0.0.1 | Yes | - | - |
| schema.traceparent.traceFlags | string | 0.0.1 | Yes | - | - |
| schema.traceparent.traceId | string | 0.0.1 | Yes | - | - |
| schema.traceparent.version | string | 0.0.1 | Yes | - | - |
| schema.userAgent | object | 0.0.1 | Yes | - | - |
| schema.userAgent.applicationName | string | 0.0.1 | Yes | - | - |
| schema.userAgent.deviceInfo | string | 0.0.1 | Yes | - | - |
| schema.userAgent.engine | string | 0.0.1 | Yes | - | - |
| schema.userAgent.platform | string | 0.0.1 | Yes | - | - |
| schema.userAgent.raw | string | 0.0.1 | Yes | - | - |
| schema.userAgent.version | string | 0.0.1 | Yes | - | - |
| schema.workflow | object | 0.0.1 | Yes | - | - |
| schema.workflow.domain | string | 0.0.1 | Yes | - | - |
| schema.workflow.instanceId | string | 0.0.1 | Yes | - | - |
| schema.workflow.raw | string | 0.0.1 | Yes | - | - |
| schema.workflow.runtimeVersion | enum | 0.0.1 | Yes | - | Legacy workflow engine (0.0.1), vNext workflow engine (0.0.1) |
| schema.workflow.workflow | string | 0.0.1 | Yes | - | - |
| schema.workflow.workflowVersion | string | 0.0.1 | Yes | - | - |
| type | string | 0.0.1 | Yes | - | - |

---

## core-schema

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| attributes | object | 0.0.1 | Yes | - | - |
| domain | string | 0.0.1 | Yes | - | - |
| flow | string | 0.0.1 | Yes | - | - |
| flowVersion | string | 0.0.1 | Yes | - | - |
| key | string | 0.0.1 | Yes | - | - |
| tags | array | 0.0.1 | Yes | - | - |
| version | string | 0.0.1 | Yes | - | - |

---

## extension

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| labels | array | 0.0.1 | Yes | - | - |
| labels[].label | string | 0.0.1 | Yes | - | - |
| labels[].language | string | 0.0.1 | Yes | - | - |
| scope | union | 0.0.1 | Yes | - | - |
| task | object | 0.0.1 | Yes | - | - |
| task.mapping | object | 0.0.1 | Yes | - | - |
| task.mapping.code | string | 0.0.1 | Yes | - | - |
| task.mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| task.mapping.location | string | 0.0.1 | Yes | - | - |
| task.mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| task.order | number | 0.0.1 | Yes | - | - |
| task.task | union | 0.0.1 | Yes | - | - |
| task.task.domain | string | 0.0.1 | Yes | - | - |
| task.task.flow | string | 0.0.1 | Yes | - | - |
| task.task.key | string | 0.0.1 | Yes | - | - |
| task.task.version | string | 0.0.1 | Yes | - | - |
| type | union | 0.0.1 | Yes | - | - |

---

## function

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| labels | array | 0.0.1 | Yes | - | - |
| labels[].label | string | 0.0.1 | Yes | - | - |
| labels[].language | string | 0.0.1 | Yes | - | - |
| onExecutionTasks | array | 0.0.1 | Yes | - | - |
| onExecutionTasks[].mapping | object | 0.0.1 | Yes | - | - |
| onExecutionTasks[].mapping.code | string | 0.0.1 | Yes | - | - |
| onExecutionTasks[].mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| onExecutionTasks[].mapping.location | string | 0.0.1 | Yes | - | - |
| onExecutionTasks[].mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| onExecutionTasks[].order | number | 0.0.1 | Yes | - | - |
| onExecutionTasks[].task | union | 0.0.1 | Yes | - | - |
| onExecutionTasks[].task.domain | string | 0.0.1 | Yes | - | - |
| onExecutionTasks[].task.flow | string | 0.0.1 | Yes | - | - |
| onExecutionTasks[].task.key | string | 0.0.1 | Yes | - | - |
| onExecutionTasks[].task.version | string | 0.0.1 | Yes | - | - |
| output | unknown | 0.0.1 | Yes | - | - |
| roles | array | 0.0.1 | Yes | - | - |
| roles[].grant | enum | 0.0.1 | Yes | - | allow (0.0.1), deny (0.0.1) |
| roles[].role | string | 0.0.1 | Yes | - | - |
| scope | enum | 0.0.1 | Yes | - | Domain (0.0.1), Flow (0.0.1), Instance (0.0.1) |
| task | object | 0.0.1 | Yes | - | - |
| task.mapping | object | 0.0.1 | Yes | - | - |
| task.mapping.code | string | 0.0.1 | Yes | - | - |
| task.mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| task.mapping.location | string | 0.0.1 | Yes | - | - |
| task.mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| task.order | number | 0.0.1 | Yes | - | - |
| task.task | union | 0.0.1 | Yes | - | - |
| task.task.domain | string | 0.0.1 | Yes | - | - |
| task.task.flow | string | 0.0.1 | Yes | - | - |
| task.task.key | string | 0.0.1 | Yes | - | - |
| task.task.version | string | 0.0.1 | Yes | - | - |

---

## schema

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| labels | array | 0.0.1 | Yes | - | - |
| labels[].label | string | 0.0.1 | Yes | - | - |
| labels[].language | string | 0.0.1 | Yes | - | - |
| schema | object | 0.0.1 | Yes | - | - |
| schema.$id | string | 0.0.1 | Yes | - | - |
| schema.$ref | string | 0.0.1 | Yes | - | - |
| schema.additionalProperties | boolean | 0.0.1 | Yes | - | - |
| schema.allOf | array | 0.0.1 | Yes | - | - |
| schema.anyOf | array | 0.0.1 | Yes | - | - |
| schema.const | unknown | 0.0.1 | Yes | - | - |
| schema.default | unknown | 0.0.1 | Yes | - | - |
| schema.description | string | 0.0.1 | Yes | - | - |
| schema.else | unknown | 0.0.1 | Yes | - | - |
| schema.enum | array | 0.0.1 | Yes | - | - |
| schema.examples | array | 0.0.1 | Yes | - | - |
| schema.format | string | 0.0.1 | Yes | - | - |
| schema.if | unknown | 0.0.1 | Yes | - | - |
| schema.items | unknown | 0.0.1 | Yes | - | - |
| schema.maxItems | number | 0.0.1 | Yes | - | - |
| schema.maxLength | number | 0.0.1 | Yes | - | - |
| schema.maximum | number | 0.0.1 | Yes | - | - |
| schema.minItems | number | 0.0.1 | Yes | - | - |
| schema.minLength | number | 0.0.1 | Yes | - | - |
| schema.minimum | number | 0.0.1 | Yes | - | - |
| schema.oneOf | array | 0.0.1 | Yes | - | - |
| schema.pattern | string | 0.0.1 | Yes | - | - |
| schema.properties | object | 0.0.1 | Yes | - | - |
| schema.required | array | 0.0.1 | Yes | - | - |
| schema.then | unknown | 0.0.1 | Yes | - | - |
| schema.title | string | 0.0.1 | Yes | - | - |
| schema.type | enum | 0.0.1 | Yes | - | object (0.0.1), array (0.0.1), string (0.0.1), number (0.0.1), integer (0.0.1) (+2 more) |
| schema.uniqueItems | boolean | 0.0.1 | Yes | - | - |
| type | enum | 0.0.1 | Yes | - | Workflow component definition (0.0.1), Task component definition (0.0.1), Function component definition (0.0.1), View component definition (0.0.1), Schema component definition (0.0.1) (+2 more) |

---

## task

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| type | enum | 0.0.1 | Yes | - | Dapr HTTP Endpoint (0.0.1), Dapr Binding (0.0.1), Dapr Service (0.0.1), Dapr PubSub (0.0.1), Human Task (0.0.1) (+10 more) |

---

## view

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| content | unknown | 0.0.1 | Yes | - | - |
| display | union | 0.0.1 | Yes | - | - |
| labels | array | 0.0.1 | Yes | - | - |
| labels[].label | string | 0.0.1 | Yes | - | - |
| labels[].language | string | 0.0.1 | Yes | - | - |
| renderer | enum | 0.0.1 | Yes | - | pseudo-ui (0.0.1), flutter (0.0.1), angular (0.0.1), vue (0.0.1), react (0.0.1) (+3 more) |
| type | union | 0.0.1 | Yes | - | - |

---

## workflow

| Field | Type | Since | Stable | Experimental | Enum Values |
|-------|------|-------|--------|--------------|-------------|
| cancel | object | 0.0.44 | Yes | - | - |
| cancel.annotations | object | 0.0.42 | Yes | - | - |
| cancel.availableIn | array | 0.0.1 | Yes | - | - |
| cancel.from | string | 0.0.1 | Yes | - | - |
| cancel.key | string | 0.0.1 | Yes | - | - |
| cancel.labels | array | 0.0.1 | Yes | - | - |
| cancel.labels[].label | string | 0.0.1 | Yes | - | - |
| cancel.labels[].language | string | 0.0.1 | Yes | - | - |
| cancel.mapping | object | 0.0.1 | Yes | - | - |
| cancel.mapping.code | string | 0.0.1 | Yes | - | - |
| cancel.mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| cancel.mapping.location | string | 0.0.1 | Yes | - | - |
| cancel.mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| cancel.onExecutionTasks | array | 0.0.1 | Yes | - | - |
| cancel.onExecutionTasks[].errorBoundary | object | 0.0.1 | Yes | - | - |
| cancel.onExecutionTasks[].errorBoundary.onError | array | 0.0.1 | Yes | - | - |
| cancel.onExecutionTasks[].errorBoundary.onTimeout | object | 0.0.1 | Yes | - | - |
| cancel.onExecutionTasks[].mapping | object | 0.0.1 | Yes | - | - |
| cancel.onExecutionTasks[].mapping.code | string | 0.0.1 | Yes | - | - |
| cancel.onExecutionTasks[].mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| cancel.onExecutionTasks[].mapping.location | string | 0.0.1 | Yes | - | - |
| cancel.onExecutionTasks[].mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| cancel.onExecutionTasks[].order | number | 0.0.1 | Yes | - | - |
| cancel.onExecutionTasks[].task | union | 0.0.1 | Yes | - | - |
| cancel.roles | array | 0.0.1 | Yes | - | - |
| cancel.roles[].grant | enum | 0.0.1 | Yes | - | allow (0.0.1), deny (0.0.1) |
| cancel.roles[].role | string | 0.0.1 | Yes | - | - |
| cancel.schema | union | 0.0.1 | Yes | - | - |
| cancel.target | string | 0.0.1 | Yes | - | - |
| cancel.triggerType | number | 0.0.1 | Yes | - | - |
| cancel.versionStrategy | enum | 0.0.1 | Yes | - | - |
| cancel.view | union | 0.0.1 | Yes | - | - |
| errorBoundary | object | 0.0.39 | Yes | - | - |
| errorBoundary.onError | array | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].action | enum | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].errorCodes | array | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].errorTypes | array | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].logOnly | boolean | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].priority | number | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].retryPolicy | object | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].retryPolicy.backoffMultiplier | number | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].retryPolicy.backoffType | enum | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].retryPolicy.initialDelay | string | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].retryPolicy.maxDelay | string | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].retryPolicy.maxRetries | number | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].retryPolicy.useJitter | boolean | 0.0.1 | Yes | - | - |
| errorBoundary.onError[].transition | string | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout | object | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.action | enum | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.defaultRetryPolicy | object | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.defaultRetryPolicy.backoffMultiplier | number | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.defaultRetryPolicy.backoffType | enum | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.defaultRetryPolicy.initialDelay | string | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.defaultRetryPolicy.maxDelay | string | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.defaultRetryPolicy.maxRetries | number | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.defaultRetryPolicy.useJitter | boolean | 0.0.1 | Yes | - | - |
| errorBoundary.onTimeout.transition | string | 0.0.1 | Yes | - | - |
| exit | object | 0.0.44 | Yes | - | - |
| exit.annotations | object | 0.0.42 | Yes | - | - |
| exit.availableIn | array | 0.0.1 | Yes | - | - |
| exit.from | string | 0.0.1 | Yes | - | - |
| exit.key | string | 0.0.1 | Yes | - | - |
| exit.labels | array | 0.0.1 | Yes | - | - |
| exit.labels[].label | string | 0.0.1 | Yes | - | - |
| exit.labels[].language | string | 0.0.1 | Yes | - | - |
| exit.mapping | object | 0.0.1 | Yes | - | - |
| exit.mapping.code | string | 0.0.1 | Yes | - | - |
| exit.mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| exit.mapping.location | string | 0.0.1 | Yes | - | - |
| exit.mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| exit.onExecutionTasks | array | 0.0.1 | Yes | - | - |
| exit.onExecutionTasks[].errorBoundary | object | 0.0.1 | Yes | - | - |
| exit.onExecutionTasks[].errorBoundary.onError | array | 0.0.1 | Yes | - | - |
| exit.onExecutionTasks[].errorBoundary.onTimeout | object | 0.0.1 | Yes | - | - |
| exit.onExecutionTasks[].mapping | object | 0.0.1 | Yes | - | - |
| exit.onExecutionTasks[].mapping.code | string | 0.0.1 | Yes | - | - |
| exit.onExecutionTasks[].mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| exit.onExecutionTasks[].mapping.location | string | 0.0.1 | Yes | - | - |
| exit.onExecutionTasks[].mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| exit.onExecutionTasks[].order | number | 0.0.1 | Yes | - | - |
| exit.onExecutionTasks[].task | union | 0.0.1 | Yes | - | - |
| exit.roles | array | 0.0.1 | Yes | - | - |
| exit.roles[].grant | enum | 0.0.1 | Yes | - | allow (0.0.1), deny (0.0.1) |
| exit.roles[].role | string | 0.0.1 | Yes | - | - |
| exit.schema | union | 0.0.1 | Yes | - | - |
| exit.target | string | 0.0.1 | Yes | - | - |
| exit.triggerType | number | 0.0.1 | Yes | - | - |
| exit.versionStrategy | enum | 0.0.1 | Yes | - | - |
| exit.view | union | 0.0.1 | Yes | - | - |
| extensions | array | 0.0.1 | Yes | - | - |
| features | array | 0.0.1 | Yes | - | - |
| functions | array | 0.0.1 | Yes | - | - |
| labels | array | 0.0.1 | Yes | - | - |
| labels[].label | string | 0.0.1 | Yes | - | - |
| labels[].language | string | 0.0.1 | Yes | - | - |
| queryRoles | array | 0.0.1 | Yes | - | - |
| queryRoles[].grant | enum | 0.0.1 | Yes | - | allow (0.0.1), deny (0.0.1) |
| queryRoles[].role | string | 0.0.1 | Yes | - | - |
| schema | object | 0.0.1 | Yes | - | - |
| schema.schema | union | 0.0.1 | Yes | - | - |
| sharedTransitions | array | 0.0.1 | Yes | - | - |
| startTransition | object | 0.0.1 | Yes | - | - |
| startTransition.annotations | object | 0.0.42 | Yes | - | - |
| startTransition.key | string | 0.0.1 | Yes | - | - |
| startTransition.labels | array | 0.0.1 | Yes | - | - |
| startTransition.labels[].label | string | 0.0.1 | Yes | - | - |
| startTransition.labels[].language | string | 0.0.1 | Yes | - | - |
| startTransition.mapping | object | 0.0.1 | Yes | - | - |
| startTransition.mapping.code | string | 0.0.1 | Yes | - | - |
| startTransition.mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| startTransition.mapping.location | string | 0.0.1 | Yes | - | - |
| startTransition.mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| startTransition.onExecutionTasks | array | 0.0.1 | Yes | - | - |
| startTransition.onExecutionTasks[].errorBoundary | object | 0.0.1 | Yes | - | - |
| startTransition.onExecutionTasks[].errorBoundary.onError | array | 0.0.1 | Yes | - | - |
| startTransition.onExecutionTasks[].errorBoundary.onTimeout | object | 0.0.1 | Yes | - | - |
| startTransition.onExecutionTasks[].mapping | object | 0.0.1 | Yes | - | - |
| startTransition.onExecutionTasks[].mapping.code | string | 0.0.1 | Yes | - | - |
| startTransition.onExecutionTasks[].mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| startTransition.onExecutionTasks[].mapping.location | string | 0.0.1 | Yes | - | - |
| startTransition.onExecutionTasks[].mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| startTransition.onExecutionTasks[].order | number | 0.0.1 | Yes | - | - |
| startTransition.onExecutionTasks[].task | union | 0.0.1 | Yes | - | - |
| startTransition.roles | array | 0.0.1 | Yes | - | - |
| startTransition.roles[].grant | enum | 0.0.1 | Yes | - | allow (0.0.1), deny (0.0.1) |
| startTransition.roles[].role | string | 0.0.1 | Yes | - | - |
| startTransition.schema | union | 0.0.1 | Yes | - | - |
| startTransition.target | string | 0.0.1 | Yes | - | - |
| startTransition.triggerType | number | 0.0.1 | Yes | - | - |
| startTransition.versionStrategy | enum | 0.0.1 | Yes | - | - |
| states | array | 0.0.1 | Yes | - | - |
| states[].errorBoundary | object | 0.0.39 | Yes | - | - |
| states[].errorBoundary.onError | array | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onError[].action | enum | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onError[].errorCodes | array | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onError[].errorTypes | array | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onError[].logOnly | boolean | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onError[].priority | number | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onError[].retryPolicy | object | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onError[].transition | string | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onTimeout | object | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onTimeout.action | enum | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onTimeout.defaultRetryPolicy | object | 0.0.1 | Yes | - | - |
| states[].errorBoundary.onTimeout.transition | string | 0.0.1 | Yes | - | - |
| states[].key | string | 0.0.1 | Yes | - | - |
| states[].labels | array | 0.0.1 | Yes | - | - |
| states[].labels[].label | string | 0.0.1 | Yes | - | - |
| states[].labels[].language | string | 0.0.1 | Yes | - | - |
| states[].onEntries | array | 0.0.1 | Yes | - | - |
| states[].onEntries[].errorBoundary | object | 0.0.1 | Yes | - | - |
| states[].onEntries[].errorBoundary.onError | array | 0.0.1 | Yes | - | - |
| states[].onEntries[].errorBoundary.onTimeout | object | 0.0.1 | Yes | - | - |
| states[].onEntries[].mapping | object | 0.0.1 | Yes | - | - |
| states[].onEntries[].mapping.code | string | 0.0.1 | Yes | - | - |
| states[].onEntries[].mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| states[].onEntries[].mapping.location | string | 0.0.1 | Yes | - | - |
| states[].onEntries[].mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| states[].onEntries[].order | number | 0.0.1 | Yes | - | - |
| states[].onEntries[].task | union | 0.0.1 | Yes | - | - |
| states[].onExits | array | 0.0.1 | Yes | - | - |
| states[].onExits[].errorBoundary | object | 0.0.1 | Yes | - | - |
| states[].onExits[].errorBoundary.onError | array | 0.0.1 | Yes | - | - |
| states[].onExits[].errorBoundary.onTimeout | object | 0.0.1 | Yes | - | - |
| states[].onExits[].mapping | object | 0.0.1 | Yes | - | - |
| states[].onExits[].mapping.code | string | 0.0.1 | Yes | - | - |
| states[].onExits[].mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| states[].onExits[].mapping.location | string | 0.0.1 | Yes | - | - |
| states[].onExits[].mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| states[].onExits[].order | number | 0.0.1 | Yes | - | - |
| states[].onExits[].task | union | 0.0.1 | Yes | - | - |
| states[].queryRoles | array | 0.0.1 | Yes | - | - |
| states[].queryRoles[].grant | enum | 0.0.1 | Yes | - | allow (0.0.1), deny (0.0.1) |
| states[].queryRoles[].role | string | 0.0.1 | Yes | - | - |
| states[].stateType | enum | 0.0.1 | Yes | - | - |
| states[].subFlow | object | 0.0.1 | Yes | - | - |
| states[].subType | enum | 0.0.1 | Yes | - | - |
| states[].transitions | array | 0.0.1 | Yes | - | - |
| states[].versionStrategy | enum | 0.0.1 | Yes | - | - |
| states[].view | union | 0.0.1 | Yes | - | - |
| timeout | object | 0.0.1 | Yes | - | - |
| timeout.key | string | 0.0.1 | Yes | - | - |
| timeout.mapping | object | 0.0.1 | Yes | - | - |
| timeout.mapping.code | string | 0.0.1 | Yes | - | - |
| timeout.mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| timeout.mapping.location | string | 0.0.1 | Yes | - | - |
| timeout.mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| timeout.target | string | 0.0.1 | Yes | - | - |
| timeout.timer | object | 0.0.1 | Yes | - | - |
| timeout.timer.duration | string | 0.0.1 | Yes | - | - |
| timeout.timer.reset | string | 0.0.1 | Yes | - | - |
| timeout.versionStrategy | enum | 0.0.1 | Yes | - | - |
| type | enum | 0.0.1 | Yes | - | Core (0.0.1), Flow (0.0.1), SubFlow (0.0.1), Sub Process (0.0.1) |
| updateData | object | 0.0.44 | Yes | - | - |
| updateData.annotations | object | 0.0.42 | Yes | - | - |
| updateData.availableIn | array | 0.0.1 | Yes | - | - |
| updateData.from | string | 0.0.1 | Yes | - | - |
| updateData.key | string | 0.0.1 | Yes | - | - |
| updateData.labels | array | 0.0.1 | Yes | - | - |
| updateData.labels[].label | string | 0.0.1 | Yes | - | - |
| updateData.labels[].language | string | 0.0.1 | Yes | - | - |
| updateData.mapping | object | 0.0.1 | Yes | - | - |
| updateData.mapping.code | string | 0.0.1 | Yes | - | - |
| updateData.mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| updateData.mapping.location | string | 0.0.1 | Yes | - | - |
| updateData.mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| updateData.onExecutionTasks | array | 0.0.1 | Yes | - | - |
| updateData.onExecutionTasks[].errorBoundary | object | 0.0.1 | Yes | - | - |
| updateData.onExecutionTasks[].errorBoundary.onError | array | 0.0.1 | Yes | - | - |
| updateData.onExecutionTasks[].errorBoundary.onTimeout | object | 0.0.1 | Yes | - | - |
| updateData.onExecutionTasks[].mapping | object | 0.0.1 | Yes | - | - |
| updateData.onExecutionTasks[].mapping.code | string | 0.0.1 | Yes | - | - |
| updateData.onExecutionTasks[].mapping.encoding | enum | 0.0.1 | Yes | - | B64 (0.0.1), NAT (0.0.1) |
| updateData.onExecutionTasks[].mapping.location | string | 0.0.1 | Yes | - | - |
| updateData.onExecutionTasks[].mapping.type | enum | 0.0.1 | Yes | - | Global (0.0.1), Local (0.0.1) |
| updateData.onExecutionTasks[].order | number | 0.0.1 | Yes | - | - |
| updateData.onExecutionTasks[].task | union | 0.0.1 | Yes | - | - |
| updateData.roles | array | 0.0.1 | Yes | - | - |
| updateData.roles[].grant | enum | 0.0.1 | Yes | - | allow (0.0.1), deny (0.0.1) |
| updateData.roles[].role | string | 0.0.1 | Yes | - | - |
| updateData.schema | union | 0.0.1 | Yes | - | - |
| updateData.target | string | 0.0.1 | Yes | - | - |
| updateData.triggerType | number | 0.0.1 | Yes | - | - |
| updateData.versionStrategy | enum | 0.0.1 | Yes | - | - |
| updateData.view | union | 0.0.1 | Yes | - | - |

### Definitions

| Definition | Type | Since | Values |
|------------|------|-------|--------|
| backoffType | enum | 0.0.39 | 0:Fixed - Fixed delay between retries (0.0.39), 1:Exponential - Exponential backoff between retries (0.0.39) |
| errorAction | enum | 0.0.39 | 0:Abort (0) - Abort execution. Transition must not be set. (0.0.39), 1:Retry (1) - Retry with configured retry policy. RetryPolicy is required. (0.0.39), 2:Rollback (2) - Rollback to compensation state. Transition is required (transition key). (0.0.39), 3:Ignore (3) - Ignore error and continue (0.0.39), 4:Notify (4) - Send notification and transition. Transition is required (transition key). (0.0.42) (+1 more) |
| stateSubType | enum | 0.0.1 | 0:No specific subtype (0.0.1), 1:Successful completion (0.0.1), 2:Error condition (0.0.1), 3:Manually terminated (0.0.1), 4:Temporarily suspended (0.0.1) (+2 more) |
| stateType | enum | 0.0.1 | 1:Initial state (0.0.1), 2:Intermediate state (0.0.1), 3:Final state (0.0.1), 4:SubFlow state (0.0.1), 5:Wizard state (0.0.40) |
| triggerKind | enum | 0.0.1 | 0:Not applicable (0.0.1), 10:Default auto transition (0.0.1) |
| triggerType | enum | 0.0.1 | 0:Manual trigger (0.0.1), 1:Automatic trigger (0.0.1), 2:Scheduled trigger (0.0.40), 3:Event trigger (0.0.42) |
| versionStrategy | enum | 0.0.1 | None:No version update (0.0.1), Patch:Patch version update (0.0.1), Minor:Minor version update (0.0.1), Major:Major version update (0.0.1) |

---

