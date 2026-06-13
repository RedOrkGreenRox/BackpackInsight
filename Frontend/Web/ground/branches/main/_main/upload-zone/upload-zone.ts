export class UploadZoneRenderer {
    public static render(tFunction: (key: string) => string): string {
        return `
            <form class="upload-zone" id="uploadForm">
                <div class="upload-area" id="uploadArea">
                    <input type="file" id="fileInput" accept=".json" style="display: none;">
                    <textarea name="json_text" id="jsonInput" placeholder="" aria-label="Вставьте JSON данные здесь"></textarea>
                    <div class="upload-hint" id="uploadHint">
                        <span>${tFunction('profile_upload_hint_1')}</span>
                        <span class="pc-only">${tFunction('profile_upload_hint_2')}</span>
                        <span>${tFunction('profile_upload_hint_3')}</span>
                    </div>
                </div>
                <button class="button-view-profile" type="submit" id="submitBtn">${tFunction('profile_view_button')}</button>
            </form>
        `;
    }
}
