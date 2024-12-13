import React, { useContext } from 'react';
import { dequal } from 'dequal';

import Image from './Image';
import Audio from './Audio';
import Video from './Video';
import { Reply } from './components';
import CollapsibleQuote from './CollapsibleQuote';
import AttachedActions from './AttachedActions';
import MessageContext from '../../Context';
import { IMessageAttachments } from '../../interfaces';
import { IAttachment } from '../../../../definitions';
import { getMessageFromAttachment } from '../../utils';

const Attachments: React.FC<IMessageAttachments> = React.memo(
	({ attachments, timeFormat, showAttachment, style, getCustomEmoji, isReply, author }: IMessageAttachments) => {
		const { translateLanguage } = useContext(MessageContext);

		if (!attachments || attachments.length === 0) {
			return null;
		}

		// Group image attachments together
		const groupAttachments = () => {
			const result = {
				images: [] as IAttachment[],
				others: [] as IAttachment[]
			};

			attachments.forEach((file: IAttachment) => {
				if (file && file.image_url) {
					result.images.push(file);
				} else {
					result.others.push(file);
				}
			});

			return result;
		};

		const { images, others } = groupAttachments();

		const renderImageGroup = () => {
			if (images.length === 0) return null;

			const msg = images.length === 1 ? getMessageFromAttachment(images[0], translateLanguage) : '';
			return (
				<Image
					key={images.map(img => img.image_url).join('-')}
					file={images[0]}
					showAttachment={showAttachment}
					getCustomEmoji={getCustomEmoji}
					style={style}
					isReply={isReply}
					author={author}
					msg={msg}
				/>
			);
		};

		const renderOtherAttachments = () =>
			others.map((file: IAttachment, index: number) => {
				const msg = getMessageFromAttachment(file, translateLanguage);

				if (file.audio_url) {
					return (
						<Audio
							key={file.audio_url}
							file={file}
							getCustomEmoji={getCustomEmoji}
							isReply={isReply}
							style={style}
							author={author}
							msg={msg}
						/>
					);
				}

				if (file.video_url) {
					return (
						<Video
							key={file.video_url}
							file={file}
							showAttachment={showAttachment}
							getCustomEmoji={getCustomEmoji}
							style={style}
							isReply={isReply}
							author={author}
							msg={msg}
						/>
					);
				}

				if (file.actions && file.actions.length > 0) {
					return <AttachedActions key={index} attachment={file} getCustomEmoji={getCustomEmoji} />;
				}

				if (typeof file.collapsed === 'boolean') {
					return (
						<CollapsibleQuote
							key={index}
							index={index}
							attachment={file}
							timeFormat={timeFormat}
							getCustomEmoji={getCustomEmoji}
						/>
					);
				}

				return (
					<Reply
						key={index}
						index={index}
						attachment={file}
						timeFormat={timeFormat}
						getCustomEmoji={getCustomEmoji}
						msg={msg}
						showAttachment={showAttachment}
					/>
				);
			});

		return (
			<>
				{renderImageGroup()}
				{renderOtherAttachments()}
			</>
		);
	},
	(prevProps, nextProps) => dequal(prevProps.attachments, nextProps.attachments)
);

Attachments.displayName = 'MessageAttachments';

export default Attachments;
