import { t } from '../../../../localization/i18n';
import { ProfileData } from '../utils/profile-types';
import { HeaderRenderer } from '../header/header';
import { HeroesSectionRenderer } from '../heroes/heroes-section';
import { ItemsSectionRenderer } from '../items/items-section';

export class ProfileLayoutRenderer {
  public static render(data: ProfileData, currentItemSort: 'rarity' | 'level'): string {
    return `
        <div class="container" id="profileContainer">
            ${HeaderRenderer.render(data)}

            <div class="button-download-profile">
                <button id="saveProfileBtn">${t('profile_save_card')}</button>
            </div>

            ${HeroesSectionRenderer.render(data)}
            ${ItemsSectionRenderer.render(data, currentItemSort)}
        </div>

        <script id="skins-data" type="application/json">
            ${JSON.stringify(data.profile_skins)}
        </script>
    `;
  }
}
