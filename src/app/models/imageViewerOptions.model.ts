
/**
 * @name ImageViewerOptionsModel
 * @description Model options for ImageViewerComponent
 * @param imageSource (string) The url or the path of the image
 * @param zoom (boolean) Enable/Disable zoom of the image
 * @param zoomButtonsPosition (string) Values: top, bottom, left, right
 * @param darkMode (boolean) Background darck or light
 * @param title (string) Text to display on the header of the view
 */
export class ImageViewerOptionsModel {

    imageSource: string;
    zoom: boolean;
    zoomButtonsPosition: string; // top, left, bottom, right
    darkMode: boolean;
    title: string;

}
