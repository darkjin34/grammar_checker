<script setup lang="ts">
const text = ref('')
const correctedText = ref('')
const errorMessage = ref('')
const isLoading = ref(false)
useHead({
  title: 'DB Grammar Correction',
})
async function correctGrammar() {
  
  if (isLoading.value || !text.value.trim()) return

  isLoading.value = true
  correctedText.value = ''
  errorMessage.value = ''

  try {
    const result = await $fetch<{ correctedText: string }>('/api/correct', {
      method: 'POST',
      body: { text: text.value },
    })
    console.log(result)
    correctedText.value = result.correctedText
  } catch (error: unknown) {
    const requestError = error as { data?: { statusMessage?: string } }
    errorMessage.value = requestError.data?.statusMessage
      || 'Something went wrong. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="grammar-page">
    <div class="workspace">
      <header class="page-header">
        <div class="brand-mark" aria-hidden="true">
          <span class="brand-letter-d">D</span>
          <span class="brand-letter-b">B</span>
        </div>

        <div class="brand-copy">
          <h1>DB Grammar Checker</h1>
          <p>Check grammar, spelling, and punctuation.</p>
        </div>
      </header>

      <form class="editor" @submit.prevent="correctGrammar">
        <div class="editor-grid">
          <div class="panel">
            <label for="original-text">Your text</label>
            <textarea
              id="original-text"
              v-model="text"
              maxlength="3000"
              placeholder="Paste or type your text here…"
            ></textarea>
            <div class="panel-footer">
              <span>{{ text.length.toLocaleString('en-US') }} / 3,000</span>
            </div>
          </div>

          <div class="panel result-panel" :aria-busy="isLoading">
            <label for="corrected-text">Corrected text</label>
            <textarea
              id="corrected-text"
              :value="correctedText"
              placeholder="Your corrected text will appear here."
              readonly
            ></textarea>
            <div class="panel-footer" role="status">
              <span v-if="isLoading">Checking your text…</span>
              <span v-else-if="correctedText">
                {{ correctedText === text.trim() ? 'No changes made' : 'Correction complete' }}
              </span>
            </div>
          </div>
        </div>

        <div class="editor-actions">
          <p v-if="errorMessage" class="error-message" role="alert">
            {{ errorMessage }}
          </p>

          <button type="submit" :disabled="isLoading || !text.trim()">
            {{ isLoading ? 'Checking…' : 'Correct grammar' }}
          </button>
        </div>
      </form>
    </div>
  </main>
</template>

<style scoped>
:global(body) {
  margin: 0;
}

.grammar-page {
  box-sizing: border-box;
  min-height: 100vh;
  padding: clamp(2rem, 7vw, 5rem) 1rem;
  background: #f3f6fb;
  color: #17243a;
  font-family: system-ui, sans-serif;
}

.workspace {
  max-width: 68rem;
  margin-inline: auto;
}

.page-header {
  margin-bottom: 1.75rem;
}

.page-header h1 {
  margin: 0;
  font-size: clamp(2rem, 5vw, 3rem);
  line-height: 1.1;
  letter-spacing: -0.045em;
}

.page-header p {
  margin: 0.75rem 0 0;
  color: #4c5d75;
  line-height: 1.6;
}

.editor {
  padding: clamp(0.75rem, 2vw, 1.25rem);
  border: 1px solid #dce3ef;
  border-radius: 1.25rem;
  background: #fff;
  box-shadow: 0 12px 32px rgb(24 44 80 / 7%);
}

.editor-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.panel {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #d8e1ee;
  border-radius: 0.875rem;
  background: #fff;
}

.result-panel {
  background: #f5f8ff;
}

.panel:focus-within {
  border-color: #305ed8;
  box-shadow: 0 0 0 2px #305ed8;
}

.panel label {
  padding: 0.875rem 1rem;
  border-bottom: 1px solid #dce3ef;
  font-size: 0.875rem;
  font-weight: 650;
}

.panel textarea {
  box-sizing: border-box;
  width: 100%;
  min-height: 16rem;
  flex: 1;
  resize: vertical;
  border: 0;
  outline: 0;
  padding: 1rem;
  background: transparent;
  color: inherit;
  font: inherit;
  line-height: 1.65;
}

.panel textarea::placeholder {
  color: #52637c;
  opacity: 1;
}

.panel-footer {
  min-height: 1.25rem;
  padding: 0.625rem 1rem;
  border-top: 1px solid #dce3ef;
  color: #4c5d75;
  font-size: 0.8125rem;
}

.editor-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding-top: 1rem;
}

.editor-actions button {
  min-height: 2.75rem;
  border: 0;
  border-radius: 0.625rem;
  padding: 0.65rem 1.125rem;
  background: #244fca;
  color: #fff;
  font: inherit;
  font-weight: 650;
  cursor: pointer;
}

.editor-actions button:hover:not(:disabled) {
  background: #193da9;
}

.editor-actions button:focus-visible {
  outline: 2px solid #244fca;
  outline-offset: 3px;
}

.editor-actions button:disabled {
  background: #e1e7f2;
  color: #4c5d75;
  cursor: default;
}

.error-message {
  flex: 1 1 15rem;
  margin: 0;
  color: #9d2222;
  font-size: 0.875rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: clamp(0.75rem, 3vw, 1.125rem);
  margin-bottom: 1.75rem;
}

.brand-mark {
  position: relative;
  display: grid;
  flex: none;
  width: clamp(3.5rem, 10vw, 4.5rem);
  aspect-ratio: 1;
  grid-template-columns: 1fr 1fr;
  place-items: center;
  box-sizing: border-box;
  padding: 0.5rem;
  border: 1px solid #354266;
  border-radius: 1.125rem;
  background: linear-gradient(145deg, #243454, #10182c);
  box-shadow: 0 8px 18px rgb(16 24 44 / 18%);
  font-size: clamp(1.65rem, 5vw, 2.25rem);
  font-weight: 850;
  line-height: 1;
}

.brand-letter-d {
  color: #fff;
  transform: translate(0.12em, -0.13em);
}

.brand-letter-b {
  color: #a5b4fc;
  transform: translate(-0.12em, 0.13em);
}

.brand-copy h1 {
  margin: 0;
  font-size: clamp(1.5rem, 4.5vw, 2.75rem);
  line-height: 1.12;
  letter-spacing: -0.045em;
}

.brand-copy p {
  margin: 0.375rem 0 0;
  color: #4c5d75;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .editor-grid {
    grid-template-columns: 1fr;
  }

  .panel textarea {
    min-height: 10rem;
  }

  .editor-actions button {
    width: 100%;
  }
}
</style>