<template>
  <el-dialog
    :model-value="visible"
    @update:model-value="$emit('update:visible', $event)"
    title="服務條款"
    width="80%"
    :close-on-click-modal="false"
    class="terms-dialog"
  >
    <div class="terms-content">
      <h3>請詳細閱讀以下服務條款。您註冊帳號或使用本服務即表示您已閱讀、理解並同意遵守本條款。</h3>

      <h4>1. 帳號註冊與使用</h4>
      <p>您須提供準確、完整且最新的註冊資訊，並對您的帳號安全負責。</p>

      <h4>2. 使用規範</h4>
      <p>您同意不利用本服務從事任何違法、侵害他人權益或違反公共秩序及善良風俗的行為。</p>

      <h4>3. 服務變更與終止</h4>
      <p>本服務保留隨時修改、暫停或終止全部或部分功能的權利，並無需事先通知。</p>

      <h4>4. 免責聲明</h4>
      <p>本服務按「現況」提供，不對其可用性、準確性或適用性作出任何明示或默示的保證。</p>

      <p class="thank-you">感謝您使用本服務！</p>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">關閉</el-button>
        <el-button type="primary" @click="handleAgree">同意並繼續</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

defineProps({
  visible: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['update:visible', 'agree'])

const handleClose = () => {
  emit('update:visible', false)
}

const handleAgree = () => {
  emit('agree')
  handleClose()
}
</script>

<style scoped>
.terms-dialog :deep(.el-dialog) {
  max-width: 800px;
}

.terms-content {
  max-height: 60vh;
  overflow-y: auto;
  padding: 0 20px;
}

.terms-content h3 {
  margin-bottom: 2rem;
  color: #303133;
  font-size: 1.2rem;
}

.terms-content h4 {
  margin: 2rem 0 1rem;
  color: #303133;
  font-size: 1.1rem;
}

.terms-content p {
  margin: 1rem 0;
  line-height: 1.6;
  color: #606266;
}

.thank-you {
  text-align: center;
  font-weight: bold;
  margin: 2rem 0;
  color: #409EFF;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
}
</style> 