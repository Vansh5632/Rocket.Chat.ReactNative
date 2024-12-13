import React, { useContext } from 'react';
import { View } from 'react-native';

import { useTheme } from '../../../../../theme';
import Markdown from '../../../../markdown';
import { useMediaAutoDownload } from '../../../hooks/useMediaAutoDownload';
import { Button } from './Button';
import { MessageImages } from './Image';
import MessageContext from '../../../Context';
import { WidthAwareView } from '../../WidthAwareView';
import { IImageContainer } from './definitions';

const ImageContainer = ({
	file,
	showAttachment,
	getCustomEmoji,
	style,
	isReply,
	author,
	msg
}: IImageContainer): React.ReactElement | null => {
	const { user } = useContext(MessageContext);
	const { theme } = useTheme();

	// Handle both single file and array of files
	const files = Array.isArray(file) ? file : [file];

	// Process files with useMediaAutoDownload outside of map
	const processedImages = files.map(singleFile =>
		useMediaAutoDownload({
			file: singleFile,
			author,
			showAttachment
		})
	);

	const imagesComponent = (
		<Button onPress={() => processedImages[0]?.onPress()}>
			<WidthAwareView>
				<MessageImages
					images={processedImages.map(({ url, status, isEncrypted }: { url: string; status: string; isEncrypted: boolean }) => ({
						uri: url,
						status,
						encrypted: isEncrypted
					}))}
				/>
			</WidthAwareView>
		</Button>
	);

	if (msg) {
		return (
			<View>
				<Markdown msg={msg} style={[isReply && style]} username={user.username} getCustomEmoji={getCustomEmoji} theme={theme} />
				{imagesComponent}
			</View>
		);
	}

	return imagesComponent;
};

ImageContainer.displayName = 'MessageImageContainer';

export default ImageContainer;
